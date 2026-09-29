import { alCambiar, borrarAjuste, db, esAjusteLocal, guardarAjuste, leerAjuste, type BaseDeDatos } from '../db'
import { fusionar, normalizar, sonIguales, TABLAS_SINCRONIZADAS, vacios, type DatosSincronizados } from './fusion'
import { comprobarAcceso, ConflictoRemoto, ErrorSincronizacion, remotoGitHub, SinConexion, type ConfigSincronizacion, type Remoto } from './github'

/**
 * Sincronización entre dispositivos:
 * 1. Lee el archivo de GitHub. 2. Lo junta con los datos de este dispositivo. 3. Guarda el resultado en los dos sitios.
 * Se hace al abrir la app, al volver a ella, al recuperar la conexión y poco después de cada cambio.
 */

const CLAVE_CONFIG = 'sync.config'
const CLAVE_ULTIMA = 'sync.ultima'
export const ARCHIVO = 'rumbo-datos.json'

interface ArchivoDatos {
  app: 'rumbo'
  version: 1
  fecha: string
  tablas: DatosSincronizados
}

/* ---------- Datos de este dispositivo ---------- */

const claveFila = (tabla: string) => (tabla === 'ajustes' ? 'clave' : 'id')

export async function extraer(base: BaseDeDatos): Promise<DatosSincronizados> {
  const datos = vacios()
  for (const t of TABLAS_SINCRONIZADAS) datos[t] = await base.table(t).toArray()
  datos.ajustes = datos.ajustes.filter((a) => !esAjusteLocal(String(a.clave)))
  return normalizar(datos)
}

/** Deja en este dispositivo exactamente esos datos (sin tocar los ajustes propios del dispositivo). */
export async function aplicar(base: BaseDeDatos, datos: DatosSincronizados): Promise<void> {
  await base.transaction('rw', TABLAS_SINCRONIZADAS.map((t) => base.table(t)), async () => {
    for (const t of TABLAS_SINCRONIZADAS) {
      const tabla = base.table(t)
      const k = claveFila(t)
      const nuevas = new Map((datos[t] ?? []).map((f) => [String(f[k]), f]))
      const actuales = await tabla.toArray()
      const sobran = actuales
        .map((f) => String(f[k]))
        .filter((id) => !nuevas.has(id) && !(t === 'ajustes' && esAjusteLocal(id)))
      const porId = new Map(actuales.map((f) => [String(f[k]), JSON.stringify(f)]))
      const cambian = [...nuevas.values()].filter((f) => porId.get(String(f[k])) !== JSON.stringify(f))
      if (sobran.length) await tabla.bulkDelete(sobran)
      if (cambian.length) await tabla.bulkPut(cambian)
    }
  })
}

function leerArchivo(texto: string): DatosSincronizados {
  const archivo = JSON.parse(texto) as Partial<ArchivoDatos>
  if (archivo.app !== 'rumbo' || !archivo.tablas) throw new ErrorSincronizacion('El archivo de GitHub no es de Rumbo.')
  return { ...vacios(), ...archivo.tablas }
}

function escribirArchivo(datos: DatosSincronizados): string {
  const archivo: ArchivoDatos = { app: 'rumbo', version: 1, fecha: new Date().toISOString(), tablas: normalizar(datos) }
  return JSON.stringify(archivo)
}

/**
 * Una ronda de sincronización. Si otro dispositivo guarda justo a la vez, vuelve a leer y juntar (hasta 3 intentos).
 * Con `usarRemoto`, los datos de este dispositivo se sustituyen por los de GitHub (primera conexión de un dispositivo nuevo).
 */
export async function sincronizarCon(base: BaseDeDatos, remoto: Remoto, usarRemoto = false): Promise<void> {
  for (let intento = 0; intento < 3; intento++) {
    const local = await extraer(base)
    const archivo = await remoto.leer()
    const datosRemotos = archivo ? leerArchivo(archivo.texto) : null
    const resultado = datosRemotos ? (usarRemoto ? normalizar(datosRemotos) : fusionar(local, datosRemotos)) : local

    if (!sonIguales(resultado, local)) await aplicar(base, resultado)
    if (datosRemotos && sonIguales(resultado, datosRemotos)) return
    try {
      await remoto.escribir(escribirArchivo(resultado), archivo?.sha ?? null)
      return
    } catch (e) {
      if (!(e instanceof ConflictoRemoto)) throw e
    }
  }
  throw new ErrorSincronizacion('No se pudo sincronizar porque otro dispositivo estaba guardando. Se reintentará.')
}

/* ---------- Configuración (solo en este dispositivo) ---------- */

export function leerConfig(base: BaseDeDatos = db) {
  return leerAjuste<ConfigSincronizacion | null>(CLAVE_CONFIG, null, base)
}

/** Resumen del archivo de GitHub, para enseñarlo antes de conectar un dispositivo nuevo. */
export interface Prueba {
  config: ConfigSincronizacion
  hayDatos: boolean
  resumen?: { fecha: Date; tareas: number; habitos: number; eventos: number }
}

/** Comprueba la clave y el repositorio y mira si ya hay datos en GitHub (no cambia nada). */
export async function probarConexion(token: string, repositorio: string, crearRemoto = remotoGitHub): Promise<Prueba> {
  const usuario = await comprobarAcceso(token.trim(), repositorio.trim())
  const config = { usuario, repositorio: repositorio.trim(), token: token.trim(), ruta: ARCHIVO }
  const archivo = await crearRemoto(config).leer()
  if (!archivo) return { config, hayDatos: false }
  const datos = JSON.parse(archivo.texto) as ArchivoDatos
  return {
    config,
    hayDatos: true,
    resumen: {
      fecha: new Date(datos.fecha),
      tareas: datos.tablas.tareas?.length ?? 0,
      habitos: datos.tablas.habitos?.length ?? 0,
      eventos: datos.tablas.eventos?.length ?? 0,
    },
  }
}

/* ---------- Estado visible y sincronización automática ---------- */

export type EstadoSincronizacion =
  | { tipo: 'desconectado' }
  | { tipo: 'sincronizando'; ultima: number | null }
  | { tipo: 'ok'; ultima: number | null }
  | { tipo: 'sinConexion'; ultima: number | null }
  | { tipo: 'error'; ultima: number | null; mensaje: string }

let estado: EstadoSincronizacion = { tipo: 'desconectado' }
const oyentes = new Set<() => void>()

function ponerEstado(nuevo: EstadoSincronizacion) {
  estado = nuevo
  oyentes.forEach((o) => o())
}

export function leerEstado(): EstadoSincronizacion {
  return estado
}

export function suscribirEstado(oyente: () => void): () => void {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}

let enMarcha: Promise<void> | null = null
let repetir = false

/** Sincroniza ya (si hay configuración). Si ya hay una sincronización en marcha, se hace otra al terminar. */
export async function sincronizarAhora(base: BaseDeDatos = db, usarRemoto = false): Promise<void> {
  if (enMarcha) {
    repetir = true
    return enMarcha
  }
  enMarcha = (async () => {
    do {
      repetir = false
      const config = await leerConfig(base)
      if (!config) {
        ponerEstado({ tipo: 'desconectado' })
        return
      }
      const ultima = await leerAjuste<number | null>(CLAVE_ULTIMA, null, base)
      ponerEstado({ tipo: 'sincronizando', ultima })
      try {
        await sincronizarCon(base, remotoGitHub(config), usarRemoto)
        usarRemoto = false
        const ahora = Date.now()
        await guardarAjuste(CLAVE_ULTIMA, ahora, base)
        ponerEstado({ tipo: 'ok', ultima: ahora })
      } catch (e) {
        if (e instanceof SinConexion) ponerEstado({ tipo: 'sinConexion', ultima })
        else ponerEstado({ tipo: 'error', ultima, mensaje: e instanceof Error ? e.message : 'Error desconocido al sincronizar.' })
        return
      }
    } while (repetir)
  })().finally(() => {
    enMarcha = null
  })
  return enMarcha
}

/** Guarda la configuración en este dispositivo y hace la primera sincronización. */
export async function conectar(config: ConfigSincronizacion, usarRemoto: boolean, base: BaseDeDatos = db): Promise<void> {
  await guardarAjuste(CLAVE_CONFIG, config, base)
  await sincronizarAhora(base, usarRemoto)
}

/** Deja de sincronizar este dispositivo (los datos se quedan aquí y en GitHub). */
export async function desconectar(base: BaseDeDatos = db): Promise<void> {
  await borrarAjuste(CLAVE_CONFIG, base)
  await borrarAjuste(CLAVE_ULTIMA, base)
  ponerEstado({ tipo: 'desconectado' })
}

let temporizador: ReturnType<typeof setTimeout> | undefined

/** Arranca la sincronización automática (se llama una vez al abrir la app). */
export function iniciarSincronizacion(base: BaseDeDatos = db): void {
  const pronto = (ms: number) => {
    clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      temporizador = undefined
      void sincronizarAhora(base)
    }, ms)
  }
  alCambiar((b) => b === base && pronto(2000))
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && pronto(300))
  window.addEventListener('online', () => pronto(300))
  // Antes de que el sistema congele la app en segundo plano, se intenta subir lo pendiente.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && temporizador) {
      clearTimeout(temporizador)
      void sincronizarAhora(base)
    }
  })
  void sincronizarAhora(base)
}

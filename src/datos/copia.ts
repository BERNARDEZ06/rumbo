import { db, esAjusteLocal, guardarAjuste, leerAjuste, type BaseDeDatos } from './db'

/** Todas las tablas que entran en la copia de seguridad. */
const TABLAS_COPIA = [
  'habitos',
  'registros',
  'asignaturas',
  'horario',
  'clasesPuntuales',
  'festivos',
  'asistencia',
  'tareas',
  'eventos',
  'ajustes',
  'borrados',
] as const

type TablaCopia = (typeof TABLAS_COPIA)[number]

export interface Copia {
  app: 'rumbo'
  version: 1
  /** Momento en que se hizo (ISO). */
  fecha: string
  tablas: Record<TablaCopia, unknown[]>
}

export const CLAVE_ULTIMA_COPIA = 'copia.ultima'

/** Reúne todos los datos del dispositivo en un solo objeto. */
export async function crearCopia(base: BaseDeDatos = db, ahora = new Date()): Promise<Copia> {
  const tablas = {} as Record<TablaCopia, unknown[]>
  for (const t of TABLAS_COPIA) tablas[t] = await base.table(t).toArray()
  // Los ajustes propios de este dispositivo (fecha de la última copia, clave de GitHub…) no van en la copia.
  tablas.ajustes = (tablas.ajustes as { clave: string }[]).filter((a) => !esAjusteLocal(a.clave))
  return { app: 'rumbo', version: 1, fecha: ahora.toISOString(), tablas }
}

export class CopiaNoValida extends Error {}

/** Comprueba que un archivo es una copia de Rumbo y la devuelve lista para importar. */
export function leerCopia(texto: string): Copia {
  let datos: unknown
  try {
    datos = JSON.parse(texto)
  } catch {
    throw new CopiaNoValida('El archivo no es una copia de seguridad válida.')
  }
  const c = datos as Partial<Copia>
  if (!c || c.app !== 'rumbo' || typeof c.tablas !== 'object' || c.tablas === null) {
    throw new CopiaNoValida('Este archivo no es una copia de seguridad de Rumbo.')
  }
  if (c.version !== 1) throw new CopiaNoValida('La copia es de una versión de la app que no se reconoce.')
  for (const t of TABLAS_COPIA) {
    const filas = (c.tablas as Record<string, unknown>)[t]
    if (filas !== undefined && !Array.isArray(filas)) throw new CopiaNoValida('La copia está dañada.')
  }
  return c as Copia
}

/** Resumen para enseñar antes de importar. */
export function resumenCopia(c: Copia) {
  const n = (t: TablaCopia) => c.tablas[t]?.length ?? 0
  return { fecha: new Date(c.fecha), habitos: n('habitos'), tareas: n('tareas'), asignaturas: n('asignaturas'), eventos: n('eventos') }
}

/** Sustituye todos los datos del dispositivo por los de la copia (todo o nada). */
export async function restaurarCopia(c: Copia, base: BaseDeDatos = db): Promise<void> {
  const tablas = TABLAS_COPIA.map((t) => base.table(t))
  await base.transaction('rw', tablas, async () => {
    // Se conservan los ajustes propios de este dispositivo (p. ej. la conexión con GitHub).
    const locales = (await base.ajustes.toArray()).filter((a) => esAjusteLocal(a.clave))
    for (const t of TABLAS_COPIA) {
      await base.table(t).clear()
      const filas = t === 'ajustes' ? (c.tablas.ajustes as { clave: string }[]).filter((a) => !esAjusteLocal(a.clave)) : (c.tablas[t] ?? [])
      if (filas.length) await base.table(t).bulkPut(filas)
    }
    if (locales.length) await base.ajustes.bulkPut(locales)
  })
}

export async function marcarCopiaHecha(base: BaseDeDatos = db, ahora = new Date()): Promise<void> {
  await guardarAjuste(CLAVE_ULTIMA_COPIA, ahora.toISOString(), base)
}

export function leerUltimaCopia(base: BaseDeDatos = db): Promise<string | null> {
  return leerAjuste<string | null>(CLAVE_ULTIMA_COPIA, null, base)
}

export function nombreArchivo(ahora = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `rumbo-copia-${ahora.getFullYear()}-${p(ahora.getMonth() + 1)}-${p(ahora.getDate())}.json`
}

/**
 * Entrega el archivo al usuario. En el móvil abre el menú de compartir (para guardarlo en Archivos o iCloud);
 * en el ordenador lo descarga directamente.
 */
export async function entregarArchivo(contenido: string, nombre: string): Promise<'compartido' | 'descargado' | 'cancelado'> {
  const archivo = new File([contenido], nombre, { type: 'application/json' })
  const tactil = window.matchMedia('(pointer: coarse)').matches
  if (tactil && navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: 'Copia de seguridad de Rumbo' })
      return 'compartido'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelado'
      // Si compartir falla por otro motivo, se intenta la descarga normal.
    }
  }
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'descargado'
}

/* ---------- Almacenamiento persistente ---------- */

/** Pide al navegador que no borre los datos de la app aunque le falte espacio o pase tiempo sin usarla. */
export async function pedirAlmacenamientoPersistente(): Promise<boolean | null> {
  if (!navigator.storage?.persist) return null
  try {
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return null
  }
}

export async function estadoAlmacenamiento(): Promise<boolean | null> {
  if (!navigator.storage?.persisted) return null
  try {
    return await navigator.storage.persisted()
  } catch {
    return null
  }
}

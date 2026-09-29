import { useLiveQuery } from 'dexie-react-hooks'
import { AlertTriangle, Check, Cloud, CloudOff, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { conectar, desconectar, leerConfig, leerEstado, probarConexion, sincronizarAhora, suscribirEstado, type Prueba } from '../../datos/sincronizacion/motor'
import { aDia, textoFechaLarga } from '../../logica/fechas'
import { Hoja } from '../Hoja'
import { Boton, Campo, claseInput } from '../ui'

function hace(ms: number | null): string {
  if (!ms) return 'nunca'
  const minutos = Math.round((Date.now() - ms) / 60000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  return horas < 24 ? `hace ${horas} h` : `hace ${Math.round(horas / 24)} días`
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-acento-suave text-sm font-semibold text-acento">{n}</span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{titulo}</p>
        <div className="mt-1 grid gap-1 text-texto-suave">{children}</div>
      </div>
    </li>
  )
}

function Enlace({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-acento underline-offset-2 hover:underline">
      {children} <ExternalLink className="size-3.5" />
    </a>
  )
}

/** Conectar este dispositivo con GitHub para tener los mismos datos en el móvil y en el ordenador. */
export function SeccionSincronizacion() {
  const config = useLiveQuery(() => leerConfig(), [])
  const estado = useSyncExternalStore(suscribirEstado, leerEstado)
  const [abierta, setAbierta] = useState(false)
  const [token, setToken] = useState('')
  const [repositorio, setRepositorio] = useState('rumbo-datos')
  const [prueba, setPrueba] = useState<Prueba | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [confirmarDesconexion, setConfirmarDesconexion] = useState(false)

  function cerrar() {
    setAbierta(false)
    setPrueba(null)
    setError(null)
    setToken('')
  }

  async function comprobar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setOcupado(true)
    try {
      const resultado = await probarConexion(token, repositorio)
      if (resultado.hayDatos) setPrueba(resultado)
      else await terminar(resultado, false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar.')
    } finally {
      setOcupado(false)
    }
  }

  async function terminar(p: Prueba, usarNube: boolean) {
    setOcupado(true)
    await conectar(p.config, usarNube)
    setOcupado(false)
    cerrar()
  }

  const ultima = 'ultima' in estado ? estado.ultima : null

  return (
    <section className="rounded-3xl border border-borde bg-superficie p-5" aria-label="Sincronización">
      <h2 className="font-semibold">Sincronizar móvil y ordenador</h2>

      {!config ? (
        <>
          <p className="mt-1 text-sm text-texto-suave">
            Guarda tus datos en un repositorio privado de tu GitHub para tener lo mismo en todos tus dispositivos. Gratis y solo lo ves tú.
          </p>
          <Boton className="mt-4 w-full sm:w-auto" onClick={() => setAbierta(true)}>
            <Cloud className="size-4" /> Configurar
          </Boton>
        </>
      ) : (
        <div className="mt-3 grid gap-3">
          <p role="status" className="flex items-start gap-2 text-sm">
            {estado.tipo === 'sincronizando' && <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-acento" />}
            {estado.tipo === 'ok' && <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={3} />}
            {estado.tipo === 'sinConexion' && <CloudOff className="mt-0.5 size-4 shrink-0 text-texto-suave" />}
            {estado.tipo === 'error' && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />}
            {estado.tipo === 'desconectado' && <Cloud className="mt-0.5 size-4 shrink-0 text-texto-suave" />}
            <span className={estado.tipo === 'error' ? 'text-red-700 dark:text-red-300' : ''}>
              {estado.tipo === 'sincronizando' && 'Sincronizando…'}
              {estado.tipo === 'ok' && `Sincronizado ${hace(ultima)}.`}
              {estado.tipo === 'sinConexion' && `Sin conexión. Última sincronización: ${hace(ultima)}.`}
              {estado.tipo === 'error' && estado.mensaje}
              {estado.tipo === 'desconectado' && 'Conectado. Pendiente de sincronizar.'}
            </span>
          </p>
          <p className="text-sm text-texto-suave">
            Guardando en <span className="font-medium text-texto">{config.usuario}/{config.repositorio}</span>
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Boton variante="secundario" onClick={() => sincronizarAhora()} disabled={estado.tipo === 'sincronizando'}>
              <RefreshCw className="size-4" /> Sincronizar ahora
            </Boton>
            <Boton
              variante="peligro"
              onClick={async () => {
                if (!confirmarDesconexion) return setConfirmarDesconexion(true)
                await desconectar()
                setConfirmarDesconexion(false)
              }}
            >
              {confirmarDesconexion ? '¿Seguro? Desconectar' : 'Desconectar este dispositivo'}
            </Boton>
          </div>
          {estado.tipo === 'error' && (
            <button type="button" onClick={() => setAbierta(true)} className="justify-self-start text-sm font-medium text-acento">
              Volver a conectar con una clave nueva
            </button>
          )}
        </div>
      )}

      <Hoja abierta={abierta} titulo={prueba ? 'Ya hay datos en GitHub' : 'Conectar con GitHub'} onCerrar={cerrar}>
        {!prueba ? (
          <form onSubmit={comprobar} className="grid gap-5">
            <ol className="grid gap-4">
              <Paso n={1} titulo="Crea un repositorio privado">
                <p>
                  Llámalo <b className="text-texto">rumbo-datos</b> y marca <b className="text-texto">Private</b>. Solo hay que hacerlo una vez.
                </p>
                <p>
                  <Enlace href="https://github.com/new?name=rumbo-datos&visibility=private">Crear repositorio</Enlace>
                </p>
              </Paso>
              <Paso n={2} titulo="Crea una clave de acceso">
                <p>
                  En «Repository access» elige <b className="text-texto">Only select repositories</b> → rumbo-datos. En «Permissions» →
                  «Repository permissions», pon <b className="text-texto">Contents: Read and write</b>. Caducidad: la más larga. Copia la clave
                  (empieza por <code>github_pat_</code>).
                </p>
                <p>
                  <Enlace href="https://github.com/settings/personal-access-tokens/new">Crear clave</Enlace>
                </p>
              </Paso>
              <Paso n={3} titulo="Pégala aquí">
                <p>Usa la misma clave en el móvil y en el ordenador.</p>
              </Paso>
            </ol>

            <Campo etiqueta="Clave de GitHub">
              <input
                className={`${claseInput} font-mono text-sm`}
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_…"
              />
            </Campo>
            <Campo etiqueta="Repositorio">
              <input className={claseInput} value={repositorio} onChange={(e) => setRepositorio(e.target.value)} autoCapitalize="none" spellCheck={false} />
            </Campo>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Boton type="submit" disabled={ocupado || token.trim().length < 20 || !repositorio.trim()} className="w-full">
              {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Cloud className="size-4" />} Conectar
            </Boton>
            <p className="-mt-2 text-center text-xs text-texto-suave">
              La clave se guarda solo en este dispositivo y no va en las copias de seguridad.
            </p>
          </form>
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-texto-suave">
              En <b className="text-texto">{prueba.config.usuario}/{prueba.config.repositorio}</b> hay datos guardados el{' '}
              {textoFechaLarga(aDia(prueba.resumen!.fecha))}: {prueba.resumen!.tareas} tareas, {prueba.resumen!.habitos} hábitos y {prueba.resumen!.eventos}{' '}
              eventos. ¿Qué hacemos con los datos de este dispositivo?
            </p>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => terminar(prueba, true)}
              className="rounded-2xl border-2 border-acento bg-acento-suave p-4 text-left transition hover:opacity-90"
            >
              <span className="block font-semibold">Usar los de GitHub (recomendado)</span>
              <span className="block text-sm text-texto-suave">Si ya usas la app en otro dispositivo. Lo de este se sustituye por lo de GitHub.</span>
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={() => terminar(prueba, false)}
              className="rounded-2xl border border-borde p-4 text-left transition hover:bg-superficie-2"
            >
              <span className="block font-semibold">Juntar los dos</span>
              <span className="block text-sm text-texto-suave">Si has apuntado cosas distintas en cada dispositivo y quieres conservarlas todas.</span>
            </button>
            {ocupado && <p className="flex items-center justify-center gap-2 text-sm text-texto-suave"><Loader2 className="size-4 animate-spin" /> Sincronizando…</p>}
          </div>
        )}
      </Hoja>
    </section>
  )
}

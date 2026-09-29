import { useLiveQuery } from 'dexie-react-hooks'
import { AlertTriangle, Download, ShieldCheck, ShieldQuestion, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  CopiaNoValida,
  crearCopia,
  entregarArchivo,
  estadoAlmacenamiento,
  leerCopia,
  leerUltimaCopia,
  marcarCopiaHecha,
  nombreArchivo,
  pedirAlmacenamientoPersistente,
  restaurarCopia,
  resumenCopia,
  type Copia,
} from '../../datos/copia'
import { aDia, diasEntre, hoy, textoFechaLarga } from '../../logica/fechas'
import { Hoja } from '../Hoja'
import { Boton } from '../ui'

const DIAS_AVISO = 14

function textoUltimaCopia(iso: string | null): { texto: string; aviso: boolean } {
  if (!iso) return { texto: 'Aún no has hecho ninguna copia.', aviso: true }
  const dias = diasEntre(aDia(new Date(iso)), hoy())
  const cuando = dias === 0 ? 'hoy' : dias === 1 ? 'ayer' : `hace ${dias} días`
  return { texto: `Última copia: ${cuando}.`, aviso: dias >= DIAS_AVISO }
}

/** Copia de seguridad (descargar y recuperar) y protección de los datos del dispositivo. */
export function SeccionDatos() {
  const ultima = useLiveQuery(() => leerUltimaCopia(), [])
  const [protegido, setProtegido] = useState<boolean | null | undefined>(undefined)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [pendiente, setPendiente] = useState<Copia | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const selector = useRef<HTMLInputElement>(null)

  useEffect(() => {
    estadoAlmacenamiento().then(setProtegido)
  }, [])

  async function descargar() {
    setMensaje(null)
    setOcupado(true)
    try {
      const copia = await crearCopia()
      const resultado = await entregarArchivo(JSON.stringify(copia), nombreArchivo())
      if (resultado !== 'cancelado') {
        await marcarCopiaHecha()
        setMensaje({ tipo: 'ok', texto: resultado === 'compartido' ? 'Copia lista. Guárdala en Archivos o iCloud.' : 'Copia descargada.' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo crear la copia. Inténtalo de nuevo.' })
    } finally {
      setOcupado(false)
    }
  }

  async function elegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    setMensaje(null)
    const archivo = e.target.files?.[0]
    e.target.value = '' // para poder elegir el mismo archivo otra vez
    if (!archivo) return
    try {
      setPendiente(leerCopia(await archivo.text()))
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof CopiaNoValida ? error.message : 'No se pudo leer el archivo.' })
    }
  }

  async function confirmarRestaurar() {
    if (!pendiente) return
    setOcupado(true)
    try {
      await restaurarCopia(pendiente)
      setMensaje({ tipo: 'ok', texto: 'Datos recuperados.' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo recuperar la copia. Tus datos no se han tocado.' })
    } finally {
      setPendiente(null)
      setOcupado(false)
    }
  }

  async function proteger() {
    setProtegido(await pedirAlmacenamientoPersistente())
  }

  const u = textoUltimaCopia(ultima ?? null)
  const resumen = pendiente ? resumenCopia(pendiente) : null

  return (
    <section className="rounded-3xl border border-borde bg-superficie p-5" aria-label="Tus datos">
      <h2 className="font-semibold">Tus datos</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Tus datos se guardan en este dispositivo (y en tu GitHub si activas la sincronización). Una copia de vez en cuando nunca está de más.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <p className={`flex items-center gap-2 text-sm ${u.aviso ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-texto-suave'}`}>
          {u.aviso && <AlertTriangle className="size-4 shrink-0" />}
          {u.texto}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Boton onClick={descargar} disabled={ocupado}>
            <Download className="size-4" /> Descargar copia
          </Boton>
          <Boton variante="secundario" onClick={() => selector.current?.click()} disabled={ocupado}>
            <Upload className="size-4" /> Recuperar una copia
          </Boton>
        </div>
        <input ref={selector} type="file" accept="application/json,.json" className="hidden" onChange={elegirArchivo} aria-label="Archivo de copia" />
        {mensaje && (
          <p role="status" className={`text-sm ${mensaje.tipo === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {mensaje.texto}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-superficie-2 p-3 text-sm">
        {protegido ? <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-texto-suave" />}
        <div className="min-w-0">
          {protegido === true && <p>Datos protegidos: el navegador no los borrará por su cuenta.</p>}
          {protegido === false && (
            <>
              <p>El navegador podría borrar los datos si pasa mucho tiempo sin usar la app o le falta espacio.</p>
              <button type="button" onClick={proteger} className="mt-1 font-medium text-acento">
                Pedir protección
              </button>
            </>
          )}
          {protegido === null && <p>Este navegador no informa de si protege los datos. Instalar la app y hacer copias es la mejor garantía.</p>}
        </div>
      </div>

      <Hoja abierta={pendiente !== null} titulo="¿Recuperar esta copia?" onCerrar={() => setPendiente(null)}>
        {resumen && (
          <div className="grid grid-cols-1 gap-4">
            <p className="text-sm text-texto-suave">
              Copia del <span className="font-medium text-texto">{textoFechaLarga(aDia(resumen.fecha))}</span>: {resumen.habitos} hábitos,{' '}
              {resumen.tareas} tareas, {resumen.asignaturas} asignaturas y {resumen.eventos} eventos.
            </p>
            <p className="flex gap-2 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0" />
              Tus datos actuales de este dispositivo se sustituirán por los de la copia.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Boton variante="secundario" onClick={() => setPendiente(null)}>
                Cancelar
              </Boton>
              <Boton onClick={confirmarRestaurar} disabled={ocupado}>
                Sustituir
              </Boton>
            </div>
          </div>
        )}
      </Hoja>
    </section>
  )
}

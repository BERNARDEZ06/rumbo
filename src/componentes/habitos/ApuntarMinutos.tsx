import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../datos/db'
import { fijarMinutos, sumarMinutos } from '../../datos/habitos'
import { hoy, textoDuracion, textoFechaLarga, type Dia } from '../../logica/fechas'
import { idRegistro } from '../../logica/habitos'
import { color } from '../colores'
import { Hoja } from '../Hoja'
import { Boton } from '../ui'

const RAPIDOS: [number, string][] = [
  [15, '+15m'],
  [30, '+30m'],
  [60, '+1h'],
  [90, '+1h30'],
  [120, '+2h'],
]

interface Props {
  /** Hábito y día en los que se apunta; null = cerrada. */
  objetivo: { habitoId: string; fecha: Dia } | null
  onCerrar: () => void
}

/** Ventana para apuntar a mano el tiempo dedicado (ej. horas de estudio). Todo se guarda al momento. */
export function ApuntarMinutos({ objetivo, onCerrar }: Props) {
  const habito = useLiveQuery(() => (objetivo ? db.habitos.get(objetivo.habitoId) : undefined), [objetivo?.habitoId])
  const registro = useLiveQuery(
    () => (objetivo ? db.registros.get(idRegistro(objetivo.habitoId, objetivo.fecha)) : undefined),
    [objetivo?.habitoId, objetivo?.fecha],
  )

  const minutos = registro?.minutos ?? 0
  const meta = habito?.meta ?? 60
  const porcentaje = Math.min(100, Math.round((minutos / meta) * 100))
  const c = color(habito?.color ?? 'indigo')
  const esHoy = objetivo?.fecha === hoy()

  return (
    <Hoja abierta={objetivo !== null} titulo={habito ? `${habito.emoji} ${habito.nombre}` : ''} onCerrar={onCerrar}>
      {objetivo && (
        <div className="grid gap-5">
          <div>
            <p className="text-sm text-texto-suave first-letter:uppercase">{esHoy ? 'Hoy' : textoFechaLarga(objetivo.fecha)}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight" aria-live="polite">
              {textoDuracion(minutos)}
              <span className="text-lg font-medium text-texto-suave"> / {textoDuracion(meta)}</span>
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-superficie-2">
              <div className={`h-full rounded-full ${c.solido} transition-all`} style={{ width: `${porcentaje}%` }} />
            </div>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-texto-suave">Añadir</span>
            <div className="grid grid-cols-5 gap-2">
              {RAPIDOS.map(([m, texto]) => (
                <Boton key={m} variante="secundario" className="!px-1 text-sm" onClick={() => sumarMinutos(objetivo.habitoId, objetivo.fecha, m)}>
                  {texto}
                </Boton>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Boton
              variante="fantasma"
              disabled={minutos === 0}
              onClick={() => sumarMinutos(objetivo.habitoId, objetivo.fecha, -15)}
            >
              −15 min
            </Boton>
            <Boton variante="fantasma" disabled={minutos === 0} onClick={() => fijarMinutos(objetivo.habitoId, objetivo.fecha, 0)}>
              Poner a 0
            </Boton>
          </div>

          <Boton onClick={onCerrar} className="w-full">
            Hecho
          </Boton>
        </div>
      )}
    </Hoja>
  )
}

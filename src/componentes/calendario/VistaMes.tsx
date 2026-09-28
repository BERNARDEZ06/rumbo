import type { Asignatura, Evento, Festivo, Tarea } from '../../datos/modelos'
import { contenidoDelDia } from '../../logica/calendario'
import { INICIALES_DIAS, mismoMes, semanasDelMes, type Dia } from '../../logica/fechas'

interface Props {
  seleccionado: Dia
  hoy: Dia
  tareas: Tarea[]
  asignaturas: Asignatura[]
  eventos: Evento[]
  festivos: Festivo[]
  /** Días con clase (para un punto discreto). */
  diasConClase: Set<Dia>
  onElegir: (dia: Dia) => void
}

const PASTILLA: Record<Tarea['tipo'], string> = {
  examen: 'bg-red-500 text-white',
  entrega: 'bg-emerald-500 text-white',
  repaso: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  otra: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
}
const PUNTO: Record<Tarea['tipo'], string> = {
  examen: 'bg-red-500',
  entrega: 'bg-emerald-500',
  repaso: 'bg-sky-500',
  otra: 'bg-amber-500',
}

/** Cuadrícula del mes: exámenes en rojo y entregas en verde, festivos en violeta. */
export function VistaMes({ seleccionado, hoy, tareas, asignaturas, eventos, festivos, diasConClase, onElegir }: Props) {
  const semanas = semanasDelMes(seleccionado)
  // En la cuadrícula se muestra la asignatura ("Macro"), más corta que el título; si no tiene, el título.
  const etiqueta = (t: Tarea) => asignaturas.find((a) => a.id === t.asignaturaId)?.corto ?? t.titulo

  return (
    <div className="overflow-hidden rounded-3xl border border-borde bg-superficie">
      <div className="grid grid-cols-7 border-b border-borde">
        {INICIALES_DIAS.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-semibold ${i >= 5 ? 'text-texto-suave/70' : 'text-texto-suave'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" role="grid" aria-label="Días del mes">
        {semanas.flat().map((dia) => {
          const { festivo, tareas: delDia, eventos: evs } = contenidoDelDia(dia, tareas, eventos, festivos)
          const pendientes = delDia.filter((t) => !t.hecha)
          const fuera = !mismoMes(dia, seleccionado)
          const elegido = dia === seleccionado
          const esHoy = dia === hoy
          const numero = Number(dia.slice(8))
          const etiquetas = [...pendientes.map((t) => t.titulo), ...evs.map((e) => e.titulo), festivo ? 'festivo' : ''].filter(Boolean)

          return (
            <button
              key={dia}
              type="button"
              role="gridcell"
              aria-selected={elegido}
              aria-label={`${numero}${etiquetas.length ? `: ${etiquetas.join(', ')}` : ''}`}
              onClick={() => onElegir(dia)}
              className={`relative flex min-h-16 flex-col items-stretch gap-0.5 border-r border-b border-borde p-1 text-left transition last:border-r-0 md:min-h-24 md:p-1.5 [&:nth-child(7n)]:border-r-0 ${
                festivo ? 'bg-violet-500/8' : ''
              } ${elegido ? 'bg-acento-suave' : 'hover:bg-superficie-2'} ${fuera ? 'opacity-40' : ''}`}
            >
              <span className="flex items-center justify-between">
                <span
                  className={`grid size-6 place-items-center rounded-full text-xs font-semibold tabular-nums md:text-sm ${
                    esHoy ? 'bg-acento text-acento-texto' : festivo ? 'text-violet-600 dark:text-violet-300' : ''
                  }`}
                >
                  {numero}
                </span>
                {diasConClase.has(dia) && <span className="mr-0.5 size-1 rounded-full bg-texto-suave/40" aria-hidden />}
              </span>

              {/* Móvil: puntos de colores */}
              <span className="flex flex-wrap gap-0.5 px-0.5 md:hidden">
                {pendientes.slice(0, 4).map((t) => (
                  <span key={t.id} className={`size-1.5 rounded-full ${PUNTO[t.tipo]}`} />
                ))}
                {evs.slice(0, 2).map((e) => (
                  <span key={e.id} className="size-1.5 rounded-full bg-violet-400" />
                ))}
              </span>

              {/* Ordenador: etiquetas como en un calendario */}
              <span className="hidden flex-col gap-0.5 md:flex">
                {festivo && <span className="truncate rounded px-1 text-[11px] font-medium text-violet-700 dark:text-violet-300">Festivo</span>}
                {pendientes.slice(0, 2).map((t) => (
                  <span key={t.id} className={`truncate rounded px-1 py-px text-[11px] font-medium ${PASTILLA[t.tipo]}`}>
                    {etiqueta(t)}
                  </span>
                ))}
                {evs.slice(0, pendientes.length >= 2 ? 0 : 2 - pendientes.length).map((e) => (
                  <span key={e.id} className="truncate rounded bg-violet-500/15 px-1 py-px text-[11px] font-medium text-violet-700 dark:text-violet-300">
                    {e.titulo}
                  </span>
                ))}
                {pendientes.length + evs.length > 2 && <span className="px-1 text-[11px] text-texto-suave">+{pendientes.length + evs.length - 2} más</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

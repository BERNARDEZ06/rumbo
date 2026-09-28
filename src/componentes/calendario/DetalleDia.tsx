import { CalendarPlus, Clock, PartyPopper, Plus } from 'lucide-react'
import type { Asignatura, Asistencia, Evento } from '../../datos/modelos'
import type { ContenidoDia } from '../../logica/calendario'
import type { ClaseDelDia } from '../../logica/clases'
import type { Dia } from '../../logica/fechas'
import { useAcciones } from '../acciones'
import { FilaTarea } from '../tareas/FilaTarea'
import { ClaseItem } from './ClaseItem'

interface Props {
  dia: Dia
  clases: ClaseDelDia[]
  contenido: ContenidoDia
  asignaturas: Asignatura[]
  marcas: Asistencia[]
  hoy: Dia
  hora: string
  /** Versión compacta (vista semana): sin botones de añadir si el día está vacío. */
  compacto?: boolean
}

function EventoItem({ evento }: { evento: Evento }) {
  const { abrirEvento } = useAcciones()
  return (
    <li>
      <button
        type="button"
        onClick={() => abrirEvento({ evento })}
        className="flex w-full items-center gap-3 rounded-2xl border border-borde bg-superficie p-3 text-left transition hover:bg-superficie-2"
      >
        <span className="w-1 self-stretch rounded-full bg-violet-400" aria-hidden />
        <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">
          {evento.inicio ?? <Clock className="size-4 text-texto-suave" aria-label="Todo el día" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{evento.titulo}</span>
          {evento.fin && <span className="block text-sm text-texto-suave">hasta las {evento.fin}</span>}
        </span>
      </button>
    </li>
  )
}

/** Todo lo de un día: festivo, clases (con asistencia), eventos y tareas. */
export function DetalleDia({ dia, clases, contenido, asignaturas, marcas, hoy, hora, compacto }: Props) {
  const { abrirTarea, abrirEvento } = useAcciones()
  const vacio = clases.length === 0 && contenido.tareas.length === 0 && contenido.eventos.length === 0

  return (
    <div className="grid grid-cols-1 gap-2">
      {contenido.festivo && (
        <div className="flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-700 dark:text-violet-300">
          <PartyPopper className="size-4" /> Festivo · {contenido.festivo.nombre}
        </div>
      )}

      {contenido.tareas.length > 0 && (
        <ul className="grid grid-cols-1 gap-2">
          {contenido.tareas.map((t) => (
            <FilaTarea key={t.id} tarea={t} asignatura={asignaturas.find((a) => a.id === t.asignaturaId)} hoy={hoy} />
          ))}
        </ul>
      )}

      {contenido.eventos.length > 0 && (
        <ul className="grid grid-cols-1 gap-2">
          {contenido.eventos.map((e) => (
            <EventoItem key={e.id} evento={e} />
          ))}
        </ul>
      )}

      {clases.length > 0 && (
        <ul className="grid grid-cols-1 gap-2" aria-label="Clases">
          {clases.map((c) => (
            <ClaseItem key={c.id} clase={c} marcas={marcas} hoy={hoy} hora={hora} />
          ))}
        </ul>
      )}

      {vacio && !contenido.festivo && <p className="px-1 py-2 text-sm text-texto-suave">Nada apuntado.</p>}

      {!compacto && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => abrirTarea({ tipo: 'examen', fecha: dia })}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-borde py-2 text-sm font-medium text-texto-suave transition hover:bg-superficie-2 hover:text-texto"
          >
            <Plus className="size-4" /> Tarea o examen
          </button>
          <button
            type="button"
            onClick={() => abrirEvento({ fecha: dia })}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-borde py-2 text-sm font-medium text-texto-suave transition hover:bg-superficie-2 hover:text-texto"
          >
            <CalendarPlus className="size-4" /> Evento
          </button>
        </div>
      )}
    </div>
  )
}

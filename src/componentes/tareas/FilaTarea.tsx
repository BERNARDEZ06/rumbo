import { Check } from 'lucide-react'
import type { Asignatura, Tarea } from '../../datos/modelos'
import { marcarTarea } from '../../datos/tareas'
import { diasEntre, textoFechaCorta, textoRelativo, type Dia } from '../../logica/fechas'
import { NOMBRE_TIPO, urgencia } from '../../logica/tareas'
import { useAcciones } from '../acciones'
import { color } from '../colores'
import { ESTILO_TIPO } from './tipos'

interface Props {
  tarea: Tarea
  asignatura?: Asignatura
  hoy: Dia
}

/** Una tarea en una lista: casilla para marcarla y, al tocarla, se abre para editar. */
export function FilaTarea({ tarea, asignatura, hoy }: Props) {
  const { abrirTarea } = useAcciones()
  const estilo = ESTILO_TIPO[tarea.tipo]
  const Icono = estilo.icono
  const hecha = tarea.hecha === 1
  const u = urgencia(tarea, hoy)

  // Cuándo: si está cerca, "En 3 días" (y en pantallas anchas también la fecha); si no, la fecha.
  let cuando: string | null = null
  let fechaExtra: string | null = null
  if (tarea.fecha) {
    const cerca = Math.abs(diasEntre(hoy, tarea.fecha)) <= 7
    cuando = cerca ? textoRelativo(hoy, tarea.fecha) : textoFechaCorta(tarea.fecha)
    if (cerca) fechaExtra = textoFechaCorta(tarea.fecha)
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
      <button
        type="button"
        onClick={() => marcarTarea(tarea.id, !hecha)}
        aria-label={hecha ? `Desmarcar ${tarea.titulo}` : `Marcar ${tarea.titulo} como hecha`}
        aria-pressed={hecha}
        className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition active:scale-90 ${
          hecha ? 'border-acento bg-acento text-acento-texto' : 'border-borde hover:border-acento'
        }`}
      >
        {hecha && <Check className="size-4" strokeWidth={3} />}
      </button>

      <button type="button" onClick={() => abrirTarea({ tarea })} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Abrir ${tarea.titulo}`}>
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-medium ${hecha ? 'text-texto-suave line-through' : ''}`}>{tarea.titulo}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-texto-suave">
            {asignatura && (
              <>
                <span className={`size-2 shrink-0 rounded-full ${color(asignatura.color).solido}`} aria-hidden />
                <span className="truncate">{asignatura.corto}</span>
              </>
            )}
            {asignatura && cuando && <span aria-hidden>·</span>}
            {cuando && (
              <span className={`shrink-0 ${!hecha && u === 'atrasada' ? 'font-medium text-red-600 dark:text-red-400' : ''} ${!hecha && u === 'hoy' ? 'font-medium text-texto' : ''}`}>
                {cuando}
                {fechaExtra && <span className="hidden font-normal text-texto-suave sm:inline"> · {fechaExtra}</span>}
                {tarea.hora && ` · ${tarea.hora}`}
              </span>
            )}
          </span>
        </span>
        <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium sm:flex ${estilo.etiqueta}`}>
          <Icono className="size-3.5" />
          {NOMBRE_TIPO[tarea.tipo]}
        </span>
        <span className={`grid size-8 shrink-0 place-items-center rounded-xl sm:hidden ${estilo.color}`} aria-label={NOMBRE_TIPO[tarea.tipo]}>
          <Icono className="size-4" />
        </span>
      </button>
    </li>
  )
}

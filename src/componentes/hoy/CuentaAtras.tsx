import { GraduationCap } from 'lucide-react'
import type { Asignatura, Tarea } from '../../datos/modelos'
import { diasEntre, textoFechaCorta, type Dia } from '../../logica/fechas'
import { useAcciones } from '../acciones'
import { color } from '../colores'

interface Props {
  examenes: Tarea[]
  asignaturas: Asignatura[]
  hoy: Dia
}

/** Tarjetas con los días que faltan para los próximos exámenes. */
export function CuentaAtras({ examenes, asignaturas, hoy }: Props) {
  const { abrirTarea } = useAcciones()
  if (examenes.length === 0) return null

  return (
    <section aria-label="Próximos exámenes">
      <h2 className="mb-2 text-xs font-semibold tracking-wide text-texto-suave uppercase">Próximos exámenes</h2>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:px-0">
        {examenes.map((t) => {
          const dias = diasEntre(hoy, t.fecha!)
          const asignatura = asignaturas.find((a) => a.id === t.asignaturaId)
          const urgente = dias <= 3
          return (
            <li key={t.id} className="w-36 shrink-0 md:w-auto">
              <button
                type="button"
                onClick={() => abrirTarea({ tarea: t })}
                aria-label={`${t.titulo}: ${dias === 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias} días`}`}
                className={`flex h-full w-full flex-col gap-2 rounded-3xl border p-3.5 text-left md:p-4 transition hover:bg-superficie-2 ${
                  urgente ? 'border-red-500/40 bg-red-500/5' : 'border-borde bg-superficie'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className={`text-2xl font-bold tracking-tight tabular-nums md:text-3xl ${urgente ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {dias === 0 ? '¡Hoy!' : dias}
                  </span>
                  <GraduationCap className={`size-5 ${urgente ? 'text-red-500' : 'text-texto-suave'}`} />
                </span>
                {dias > 0 && <span className="-mt-2 text-xs font-medium text-texto-suave">{dias === 1 ? 'día · mañana' : 'días'}</span>}
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-semibold leading-snug md:text-base">{t.titulo}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-texto-suave">
                    {asignatura && <span className={`size-2 shrink-0 rounded-full ${color(asignatura.color).solido}`} />}
                    {textoFechaCorta(t.fecha!)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

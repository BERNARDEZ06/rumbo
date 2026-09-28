import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Asistencia } from '../../datos/modelos'
import { resumenAsistencia, type DatosClases } from '../../logica/clases'
import { sumarDias, type Dia } from '../../logica/fechas'
import { color } from '../colores'

interface Props {
  datos: DatosClases
  marcas: Asistencia[]
  hoy: Dia
  hora: string
}

/** Porcentaje de asistencia de cada asignatura en lo que va de cuatrimestre. */
export function ResumenAsistencia({ datos, marcas, hoy, hora }: Props) {
  const [abierto, setAbierto] = useState(false)
  if (!datos.periodo) return null
  const hasta = hoy < datos.periodo.hasta ? hoy : datos.periodo.hasta
  const resumen = resumenAsistencia(datos, marcas, datos.periodo.desde, hasta, hora, sumarDias).filter((r) => r.total > 0)
  const total = resumen.reduce((t, r) => t + r.total, 0)
  const asistidas = resumen.reduce((t, r) => t + r.asistidas, 0)
  const global = total ? Math.round((asistidas / total) * 100) : null

  return (
    <section className="rounded-3xl border border-borde bg-superficie p-5">
      <button type="button" onClick={() => setAbierto((a) => !a)} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={abierto}>
        <span>
          <span className="block font-semibold">Asistencia</span>
          <span className="block text-sm text-texto-suave">
            {global === null ? 'Aún no ha habido clases' : `${global} % en lo que va de cuatrimestre · ${asistidas} de ${total} clases`}
          </span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-texto-suave transition ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <ul className="mt-4 grid gap-3">
          {resumen.map((r) => {
            const a = datos.asignaturas.find((x) => x.id === r.asignaturaId)!
            const bajo = (r.porcentaje ?? 100) < 80
            return (
              <li key={r.asignaturaId}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${color(a.color).solido}`} />
                    <span className="truncate font-medium">{a.corto}</span>
                  </span>
                  <span className={`shrink-0 tabular-nums ${bajo ? 'font-semibold text-red-600 dark:text-red-400' : 'text-texto-suave'}`}>
                    {r.porcentaje} % · {r.asistidas}/{r.total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-superficie-2">
                  <div className={`h-full rounded-full ${bajo ? 'bg-red-500' : color(a.color).solido}`} style={{ width: `${r.porcentaje}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

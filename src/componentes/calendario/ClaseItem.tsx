import { Check, MapPin, X } from 'lucide-react'
import { marcarAsistencia } from '../../datos/clases'
import type { Asistencia } from '../../datos/modelos'
import { enCurso } from '../../logica/calendario'
import { estadoAsistencia, type ClaseDelDia } from '../../logica/clases'
import type { Dia } from '../../logica/fechas'
import { color } from '../colores'

interface Props {
  clase: ClaseDelDia
  marcas: Asistencia[]
  hoy: Dia
  hora: string
}

/**
 * Una clase con su asistencia:
 * - Terminada: "Fui" por defecto; un toque la cambia a "No fui" y otro la devuelve.
 * - Aún no terminada: "Pendiente"; un toque la marca como "No iré".
 */
export function ClaseItem({ clase, marcas, hoy, hora }: Props) {
  const c = color(clase.asignatura?.color ?? 'slate')
  const estado = estadoAsistencia(clase, marcas, hoy, hora)
  const ahora = enCurso(clase, hoy, hora)
  const terminada = clase.fecha < hoy || (clase.fecha === hoy && hora >= clase.fin)
  const nombre = clase.asignatura?.corto ?? 'Clase'

  // Si se falta, se guarda la falta; si se vuelve a "fui", se borra la marca (por defecto ya cuenta como asistida).
  const alternar = () => marcarAsistencia(clase.id, clase.fecha, estado === 'falta' ? null : false)

  let chip: { texto: string; clase: string; icono?: typeof Check; etiqueta: string }
  if (estado === 'falta') {
    chip = {
      texto: terminada ? 'No fui' : 'No iré',
      clase: 'bg-red-500/10 text-red-600 dark:text-red-400',
      icono: X,
      etiqueta: `${nombre}: ${terminada ? 'no fui' : 'no iré'}. Tocar para cambiar`,
    }
  } else if (estado === 'asistida') {
    chip = { texto: 'Fui', clase: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400', icono: Check, etiqueta: `${nombre}: fui. Tocar si no fuiste` }
  } else {
    chip = {
      texto: ahora ? 'Ahora' : 'Pendiente',
      clase: ahora ? 'bg-acento text-acento-texto' : 'bg-superficie-2 text-texto-suave',
      etiqueta: `${nombre}: pendiente. Tocar si no vas a ir`,
    }
  }
  const Icono = chip.icono

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
      <span className={`w-1 self-stretch rounded-full ${c.solido}`} aria-hidden />
      <div className="w-12 shrink-0 text-sm tabular-nums">
        <div className="font-semibold">{clase.inicio}</div>
        <div className="text-texto-suave">{clase.fin}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate font-medium ${estado === 'falta' ? 'text-texto-suave line-through' : ''}`}>
          {nombre}
          {clase.detalle && <span className="font-normal text-texto-suave"> · {clase.detalle}</span>}
        </div>
        {clase.aula && (
          <div className="flex items-center gap-1 truncate text-sm text-texto-suave">
            <MapPin className="size-3.5 shrink-0" /> {clase.aula}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={alternar}
        aria-label={chip.etiqueta}
        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${chip.clase}`}
      >
        {Icono && <Icono className="size-3.5" strokeWidth={3} />}
        {chip.texto}
      </button>
    </li>
  )
}

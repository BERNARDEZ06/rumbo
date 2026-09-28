import { Check, Plus } from 'lucide-react'
import { alternarDia } from '../../datos/habitos'
import type { Habito, Registro } from '../../datos/modelos'
import { textoDuracion, type Dia } from '../../logica/fechas'
import { esDeSemana, minutosDelDia, progresoSemana } from '../../logica/habitos'
import { useAcciones } from '../acciones'
import { color } from '../colores'

interface Props {
  habito: Habito
  registros: Registro[]
  hoy: Dia
}

/** Versión compacta de un hábito para la pantalla Hoy: cómo va la semana y el botón para marcar. */
export function HabitoHoy({ habito, registros, hoy }: Props) {
  const { apuntarMinutos } = useAcciones()
  const c = color(habito.color)
  const semana = progresoSemana(habito, registros, hoy)
  const esTiempo = habito.tipo === 'tiempo'
  const minutosHoy = minutosDelDia(registros, hoy)
  const hechoHoy = semana.dias.find((d) => d.fecha === hoy)?.cumplido ?? false

  let progreso: string
  let porcentaje: number
  if (esTiempo && habito.periodo === 'semana') {
    progreso = semana.objetivo === 0 ? 'Semana libre' : `${textoDuracion(semana.minutos)} de ${textoDuracion(semana.objetivo)} esta semana`
    porcentaje = semana.objetivo ? semana.minutos / semana.objetivo : 1
  } else if (esTiempo) {
    progreso = `${textoDuracion(minutosHoy)} de ${textoDuracion(habito.meta)} hoy`
    porcentaje = minutosHoy / habito.meta
  } else if (esDeSemana(habito)) {
    progreso = semana.objetivo === 0 ? 'Semana libre' : `${semana.hechos} de ${semana.objetivo} días esta semana`
    porcentaje = semana.objetivo ? semana.hechos / semana.objetivo : 1
  } else {
    progreso = hechoHoy ? 'Hecho hoy' : 'Pendiente hoy'
    porcentaje = hechoHoy ? 1 : 0
  }
  const cumplida = semana.cumplida && esDeSemana(habito) && semana.objetivo > 0

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xl ${c.suave}`} aria-hidden>
        {habito.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{habito.nombre}</span>
          {cumplida && <Check className={`size-4 shrink-0 ${c.texto}`} strokeWidth={3} aria-label="objetivo de la semana cumplido" />}
        </div>
        <div className="truncate text-sm text-texto-suave">{progreso}</div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-superficie-2" aria-hidden>
          <div className={`h-full rounded-full ${c.solido} transition-all`} style={{ width: `${Math.min(100, porcentaje * 100)}%` }} />
        </div>
      </div>
      {esTiempo ? (
        <button
          type="button"
          onClick={() => apuntarMinutos(habito.id, hoy)}
          aria-label={`Apuntar tiempo de ${habito.nombre}`}
          className={`flex h-10 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-semibold transition active:scale-95 ${c.suave} ${c.texto}`}
        >
          <Plus className="size-4" />
          {minutosHoy > 0 ? textoDuracion(minutosHoy) : 'Apuntar'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => alternarDia(habito.id, hoy)}
          aria-label={hechoHoy ? `Desmarcar ${habito.nombre} hoy` : `Marcar ${habito.nombre} hoy`}
          aria-pressed={hechoHoy}
          className={`grid size-10 shrink-0 place-items-center rounded-xl border-2 transition active:scale-95 ${
            hechoHoy ? `${c.solido} ${c.borde} text-white` : 'border-borde text-texto-suave hover:bg-superficie-2'
          }`}
        >
          <Check className="size-5" strokeWidth={hechoHoy ? 3 : 2} />
        </button>
      )}
    </li>
  )
}

import { Check, Flame, Plus } from 'lucide-react'
import { alternarDia } from '../../datos/habitos'
import type { Habito, Registro } from '../../datos/modelos'
import { INICIALES_DIAS, textoDuracion, type Dia } from '../../logica/fechas'
import { calcularRacha, minutosDelDia, progresoSemana, textoMeta, textoRacha } from '../../logica/habitos'
import { useAcciones } from '../acciones'
import { color } from '../colores'

interface Props {
  habito: Habito
  /** Marcas de este hábito. */
  registros: Registro[]
  hoy: Dia
  onEditar: () => void
}

export function TarjetaHabito({ habito, registros, hoy, onEditar }: Props) {
  const { apuntarMinutos } = useAcciones()
  const c = color(habito.color)
  const semana = progresoSemana(habito, registros, hoy)
  const racha = calcularRacha(habito, registros, hoy)
  const esTiempo = habito.tipo === 'tiempo'
  const minutosHoy = minutosDelDia(registros, hoy)
  const hechoHoy = semana.dias.find((d) => d.fecha === hoy)?.cumplido ?? false

  const tocarDia = (fecha: Dia) => (esTiempo ? apuntarMinutos(habito.id, fecha) : alternarDia(habito.id, fecha))

  const resumenSemana = esTiempo
    ? `${textoDuracion(semana.minutos)} esta semana`
    : `${semana.hechos}/${semana.objetivo} esta semana`

  return (
    <article className="rounded-3xl border border-borde bg-superficie p-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onEditar} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Editar ${habito.nombre}`}>
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ${c.suave}`} aria-hidden>
            {habito.emoji}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{habito.nombre}</span>
            <span className="block truncate text-sm text-texto-suave">{textoMeta(habito)}</span>
          </span>
        </button>

        {esTiempo ? (
          <button
            type="button"
            onClick={() => apuntarMinutos(habito.id, hoy)}
            aria-label={`Apuntar tiempo de ${habito.nombre}`}
            className={`flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-3 text-sm font-semibold transition active:scale-95 ${
              hechoHoy ? `${c.solido} text-white` : `${c.suave} ${c.texto}`
            }`}
          >
            {hechoHoy ? <Check className="size-4" /> : <Plus className="size-4" />}
            {minutosHoy > 0 ? textoDuracion(minutosHoy) : 'Apuntar'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => alternarDia(habito.id, hoy)}
            aria-label={hechoHoy ? `Desmarcar ${habito.nombre} hoy` : `Marcar ${habito.nombre} hoy`}
            aria-pressed={hechoHoy}
            className={`grid size-12 shrink-0 place-items-center rounded-2xl border-2 transition active:scale-95 ${
              hechoHoy ? `${c.solido} ${c.borde} text-white` : 'border-borde text-texto-suave hover:bg-superficie-2'
            }`}
          >
            <Check className="size-6" strokeWidth={hechoHoy ? 3 : 2} />
          </button>
        )}
      </div>

      {/* Semana de lunes a domingo: se puede tocar cualquier día pasado para corregir */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {semana.dias.map((d, i) => {
          const futuro = d.fecha > hoy
          const parcial = esTiempo && !d.cumplido && d.minutos > 0
          return (
            <button
              key={d.fecha}
              type="button"
              disabled={futuro}
              onClick={() => tocarDia(d.fecha)}
              aria-label={`${INICIALES_DIAS[i]} ${d.fecha}${d.cumplido ? ', hecho' : ''}`}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
            >
              <span className={`text-[11px] font-medium ${d.fecha === hoy ? 'text-texto' : 'text-texto-suave'}`}>{INICIALES_DIAS[i]}</span>
              <span
                className={`grid size-8 place-items-center rounded-full text-[10px] font-semibold transition ${
                  d.cumplido ? `${c.solido} text-white` : parcial ? `${c.suave} ${c.texto}` : 'bg-superficie-2'
                } ${d.fecha === hoy ? 'ring-2 ring-texto/20 ring-offset-2 ring-offset-superficie' : ''}`}
              >
                {d.cumplido ? <Check className="size-4" strokeWidth={3} /> : parcial ? Math.round(d.minutos / 6) / 10 + 'h' : ''}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-texto-suave">{resumenSemana}</span>
        <span className={`flex items-center gap-1 font-medium ${racha.actual > 0 ? 'text-orange-500' : 'text-texto-suave'}`}>
          <Flame className="size-4" />
          {textoRacha(racha.actual, racha.unidad)}
          {racha.mejor > racha.actual && <span className="font-normal text-texto-suave">· mejor {racha.mejor}</span>}
        </span>
      </div>
    </article>
  )
}

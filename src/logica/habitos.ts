import type { Habito, Registro } from '../datos/modelos'
import { diasDeLaSemana, lunesDe, sumarDias, textoDuracion, type Dia } from './fechas'

type HabitoMin = Pick<Habito, 'tipo' | 'meta'>
type RegistroMin = Pick<Registro, 'fecha' | 'minutos'>

/** Id fijo por hábito y día: así nunca hay dos marcas del mismo día (tampoco al sincronizar). */
export function idRegistro(habitoId: string, fecha: Dia): string {
  return `${habitoId}|${fecha}`
}

/** Minutos apuntados en un día (solo para hábitos de tiempo). */
export function minutosDelDia(registros: RegistroMin[], fecha: Dia): number {
  return registros.filter((r) => r.fecha === fecha).reduce((total, r) => total + (r.minutos ?? 0), 0)
}

/** ¿Está cumplido ese día? En los de tiempo, hay que llegar a los minutos de la meta. */
export function cumplidoEnDia(habito: HabitoMin, registros: RegistroMin[], fecha: Dia): boolean {
  if (habito.tipo === 'tiempo') return minutosDelDia(registros, fecha) >= habito.meta
  return registros.some((r) => r.fecha === fecha)
}

function diasCumplidos(habito: HabitoMin, registros: RegistroMin[]): Set<Dia> {
  const dias = new Set(registros.map((r) => r.fecha))
  return new Set([...dias].filter((d) => cumplidoEnDia(habito, registros, d)))
}

export interface ProgresoSemana {
  /** Días cumplidos esta semana. */
  hechos: number
  /** Objetivo de la semana (7 en diarios y de tiempo; X en semanales). */
  objetivo: number
  /** Para hábitos de tiempo: minutos totales de la semana. */
  minutos: number
  /** Lunes a domingo: si cada día está cumplido. */
  dias: { fecha: Dia; cumplido: boolean; minutos: number }[]
}

export function progresoSemana(habito: HabitoMin, registros: RegistroMin[], dia: Dia): ProgresoSemana {
  const dias = diasDeLaSemana(dia).map((fecha) => ({
    fecha,
    cumplido: cumplidoEnDia(habito, registros, fecha),
    minutos: minutosDelDia(registros, fecha),
  }))
  return {
    hechos: dias.filter((d) => d.cumplido).length,
    objetivo: habito.tipo === 'semanal' ? habito.meta : 7,
    minutos: dias.reduce((t, d) => t + d.minutos, 0),
    dias,
  }
}

function semanaCumplida(habito: HabitoMin, cumplidos: Set<Dia>, lunes: Dia): boolean {
  const n = diasDeLaSemana(lunes).filter((d) => cumplidos.has(d)).length
  return n >= habito.meta
}

export interface Racha {
  actual: number
  mejor: number
  /** "días" o "semanas" */
  unidad: 'días' | 'semanas'
}

/**
 * Racha actual y mejor racha.
 * - Diarios y de tiempo: días seguidos cumplidos. Si hoy aún no está hecho, la racha sigue viva desde ayer.
 * - Semanales: semanas seguidas llegando a la meta. La semana en curso solo suma si ya se ha cumplido.
 */
export function calcularRacha(habito: HabitoMin, registros: RegistroMin[], hoy: Dia): Racha {
  const cumplidos = diasCumplidos(habito, registros)

  if (habito.tipo === 'semanal') {
    const lunesHoy = lunesDe(hoy)
    let actual = 0
    let lunes = semanaCumplida(habito, cumplidos, lunesHoy) ? lunesHoy : sumarDias(lunesHoy, -7)
    while (semanaCumplida(habito, cumplidos, lunes)) {
      actual++
      lunes = sumarDias(lunes, -7)
    }
    const semanas = [...new Set([...cumplidos].map(lunesDe))].sort()
    let mejor = 0
    let seguidas = 0
    let anterior: Dia | null = null
    for (const l of semanas) {
      if (!semanaCumplida(habito, cumplidos, l)) {
        seguidas = 0
        anterior = null
        continue
      }
      seguidas = anterior !== null && sumarDias(anterior, 7) === l ? seguidas + 1 : 1
      anterior = l
      mejor = Math.max(mejor, seguidas)
    }
    return { actual, mejor: Math.max(mejor, actual), unidad: 'semanas' }
  }

  let actual = 0
  let dia = cumplidos.has(hoy) ? hoy : sumarDias(hoy, -1)
  while (cumplidos.has(dia)) {
    actual++
    dia = sumarDias(dia, -1)
  }
  let mejor = 0
  let seguidos = 0
  let anterior: Dia | null = null
  for (const d of [...cumplidos].sort()) {
    seguidos = anterior !== null && sumarDias(anterior, 1) === d ? seguidos + 1 : 1
    anterior = d
    mejor = Math.max(mejor, seguidos)
  }
  return { actual, mejor: Math.max(mejor, actual), unidad: 'días' }
}

/** Texto de la meta: "Cada día", "4 días por semana", "2 h al día". */
export function textoMeta(habito: HabitoMin): string {
  if (habito.tipo === 'diario') return 'Cada día'
  if (habito.tipo === 'semanal') return habito.meta === 1 ? '1 día por semana' : `${habito.meta} días por semana`
  return `${textoDuracion(habito.meta)} al día`
}

/** "1 día", "3 semanas"… */
export function textoRacha(n: number, unidad: Racha['unidad']): string {
  if (n === 1) return unidad === 'días' ? '1 día' : '1 semana'
  return `${n} ${unidad}`
}

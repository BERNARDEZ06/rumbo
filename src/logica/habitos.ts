import type { Habito, Registro } from '../datos/modelos'
import { diasDeLaSemana, lunesDe, sumarDias, textoDuracion, type Dia } from './fechas'

type HabitoMin = Pick<Habito, 'tipo' | 'meta'> & Partial<Pick<Habito, 'periodo' | 'ajustesSemana'>>
type RegistroMin = Pick<Registro, 'fecha' | 'minutos'>

/** Id fijo por hábito y día: así nunca hay dos marcas del mismo día (tampoco al sincronizar). */
export function idRegistro(habitoId: string, fecha: Dia): string {
  return `${habitoId}|${fecha}`
}

/** ¿Se mide por semanas? (X días por semana, o tiempo por semana). */
export function esDeSemana(habito: HabitoMin): boolean {
  return habito.tipo === 'semanal' || (habito.tipo === 'tiempo' && habito.periodo === 'semana')
}

/** Meta de una semana concreta: la ajustada para esa semana o, si no hay, la habitual. */
export function metaDeLaSemana(habito: HabitoMin, dia: Dia): number {
  return habito.ajustesSemana?.[lunesDe(dia)] ?? habito.meta
}

/** Minutos apuntados en un día (solo para hábitos de tiempo). */
export function minutosDelDia(registros: RegistroMin[], fecha: Dia): number {
  return registros.filter((r) => r.fecha === fecha).reduce((total, r) => total + (r.minutos ?? 0), 0)
}

/**
 * ¿Está cumplido ese día?
 * - Tiempo al día: hay que llegar a la meta de minutos.
 * - Tiempo a la semana: basta con haber apuntado algo ese día.
 * - Resto: basta con marcarlo.
 */
export function cumplidoEnDia(habito: HabitoMin, registros: RegistroMin[], fecha: Dia): boolean {
  if (habito.tipo === 'tiempo') {
    const minutos = minutosDelDia(registros, fecha)
    return habito.periodo === 'semana' ? minutos > 0 : minutos >= habito.meta
  }
  return registros.some((r) => r.fecha === fecha)
}

export interface ProgresoSemana {
  /** Días cumplidos esta semana. */
  hechos: number
  /** Objetivo de la semana: días (7 en diarios; X en semanales) o minutos (tiempo a la semana). */
  objetivo: number
  /** Minutos totales de la semana (hábitos de tiempo). */
  minutos: number
  /** ¿Se ha llegado ya al objetivo de la semana? */
  cumplida: boolean
  /** ¿El objetivo de esta semana está ajustado (distinto del habitual)? */
  ajustada: boolean
  /** Lunes a domingo. */
  dias: { fecha: Dia; cumplido: boolean; minutos: number }[]
}

export function progresoSemana(habito: HabitoMin, registros: RegistroMin[], dia: Dia): ProgresoSemana {
  const dias = diasDeLaSemana(dia).map((fecha) => ({
    fecha,
    cumplido: cumplidoEnDia(habito, registros, fecha),
    minutos: minutosDelDia(registros, fecha),
  }))
  const hechos = dias.filter((d) => d.cumplido).length
  const minutos = dias.reduce((t, d) => t + d.minutos, 0)
  const objetivo = esDeSemana(habito) ? metaDeLaSemana(habito, dia) : 7
  const porTiempo = habito.tipo === 'tiempo' && habito.periodo === 'semana'
  return {
    hechos,
    objetivo,
    minutos,
    cumplida: porTiempo ? minutos >= objetivo : hechos >= objetivo,
    ajustada: esDeSemana(habito) && habito.ajustesSemana?.[lunesDe(dia)] !== undefined,
    dias,
  }
}

export interface Racha {
  actual: number
  mejor: number
  unidad: 'días' | 'semanas'
}

function rachaDeSemanas(habito: HabitoMin, registros: RegistroMin[], hoy: Dia): Racha {
  const cumplida = (lunes: Dia) => progresoSemana(habito, registros, lunes).cumplida
  const lunesHoy = lunesDe(hoy)

  let actual = 0
  let lunes = cumplida(lunesHoy) ? lunesHoy : sumarDias(lunesHoy, -7)
  // Tope de seguridad: una semana "libre" (meta 0) sin datos antes no debe contar hacia atrás sin fin.
  const primera = registros.length ? lunesDe(registros.map((r) => r.fecha).sort()[0]) : lunesHoy
  while (lunes >= primera && cumplida(lunes)) {
    actual++
    lunes = sumarDias(lunes, -7)
  }

  let mejor = 0
  let seguidas = 0
  for (let l = primera; l <= lunesHoy; l = sumarDias(l, 7)) {
    if (cumplida(l)) {
      seguidas++
      mejor = Math.max(mejor, seguidas)
    } else if (l !== lunesHoy) {
      seguidas = 0 // la semana en curso sin cumplir aún no rompe nada
    }
  }
  return { actual, mejor: Math.max(mejor, actual), unidad: 'semanas' }
}

/**
 * Racha actual y mejor racha.
 * - Diarios y de tiempo al día: días seguidos cumplidos. Si hoy aún no está hecho, la racha sigue viva desde ayer.
 * - Semanales y de tiempo a la semana: semanas seguidas llegando a la meta de cada semana.
 *   La semana en curso solo suma si ya se ha cumplido.
 */
export function calcularRacha(habito: HabitoMin, registros: RegistroMin[], hoy: Dia): Racha {
  if (esDeSemana(habito)) return rachaDeSemanas(habito, registros, hoy)

  const cumplidos = new Set(registros.map((r) => r.fecha).filter((d) => cumplidoEnDia(habito, registros, d)))
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

/** "4 días", "1 día" */
export function textoDias(n: number): string {
  return n === 1 ? '1 día' : `${n} días`
}

/** Texto de la meta: "Cada día", "4 días por semana", "2 h al día", "14 h por semana". */
export function textoMeta(habito: HabitoMin): string {
  if (habito.tipo === 'diario') return 'Cada día'
  if (habito.tipo === 'semanal') return `${textoDias(habito.meta)} por semana`
  return habito.periodo === 'semana' ? `${textoDuracion(habito.meta)} por semana` : `${textoDuracion(habito.meta)} al día`
}

/** "1 día", "3 semanas"… */
export function textoRacha(n: number, unidad: Racha['unidad']): string {
  if (n === 1) return unidad === 'días' ? '1 día' : '1 semana'
  return `${n} ${unidad}`
}

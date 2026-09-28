import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  getISODay,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * En toda la app un día se representa como texto "AAAA-MM-DD" (ej. "2026-09-28").
 * Así no hay problemas de zonas horarias ni de cambios de hora.
 */
export type Dia = string

const FORMATO = 'yyyy-MM-dd'
const SEMANA = { weekStartsOn: 1 as const } // la semana empieza el lunes

export function aDia(fecha: Date): Dia {
  return format(fecha, FORMATO)
}

export function deDia(dia: Dia): Date {
  return parse(dia, FORMATO, new Date(2000, 0, 1))
}

export function esDiaValido(dia: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) && isValid(deDia(dia)) && aDia(deDia(dia)) === dia
}

export function hoy(ahora: Date = new Date()): Dia {
  return aDia(ahora)
}

export function sumarDias(dia: Dia, n: number): Dia {
  return aDia(addDays(deDia(dia), n))
}

/** Días de diferencia (b - a). Ej.: de hoy al examen. */
export function diasEntre(a: Dia, b: Dia): number {
  return differenceInCalendarDays(deDia(b), deDia(a))
}

/** 1 = lunes … 7 = domingo. */
export function diaDeLaSemana(dia: Dia): number {
  return getISODay(deDia(dia))
}

/** Lunes de la semana en la que cae ese día. */
export function lunesDe(dia: Dia): Dia {
  return aDia(startOfWeek(deDia(dia), SEMANA))
}

/** Los 7 días (lunes a domingo) de la semana de ese día. */
export function diasDeLaSemana(dia: Dia): Dia[] {
  const lunes = lunesDe(dia)
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
}

/** Primer día del mes siguiente (n = 1) o anterior (n = -1). */
export function sumarMeses(dia: Dia, n: number): Dia {
  return aDia(addMonths(startOfMonth(deDia(dia)), n))
}

/**
 * Cuadrícula del mes para el calendario: semanas completas de lunes a domingo
 * (incluye días del mes anterior y siguiente para rellenar).
 */
export function semanasDelMes(dia: Dia): Dia[][] {
  const fecha = deDia(dia)
  const primero = aDia(startOfWeek(startOfMonth(fecha), SEMANA))
  const ultimo = aDia(endOfWeek(endOfMonth(fecha), SEMANA))
  const semanas: Dia[][] = []
  for (let d = primero; d <= ultimo; d = sumarDias(d, 7)) {
    semanas.push(Array.from({ length: 7 }, (_, i) => sumarDias(d, i)))
  }
  return semanas
}

export function mismoMes(a: Dia, b: Dia): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

/* ---------- Textos en español ---------- */

/** "lunes, 28 de septiembre" */
export function textoFechaLarga(dia: Dia): string {
  return format(deDia(dia), "EEEE, d 'de' MMMM", { locale: es })
}

/** "lun 28 sept" */
export function textoFechaCorta(dia: Dia): string {
  return format(deDia(dia), 'EEE d MMM', { locale: es }).replace(/\./g, '')
}

/** "septiembre 2026" */
export function textoMes(dia: Dia): string {
  return format(deDia(dia), 'MMMM yyyy', { locale: es })
}

/** Iniciales de los días para la cabecera del calendario. */
export const INICIALES_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/** "Hoy", "Mañana", "Ayer", "En 5 días", "Hace 3 días". */
export function textoRelativo(desde: Dia, hasta: Dia): string {
  const n = diasEntre(desde, hasta)
  if (n === 0) return 'Hoy'
  if (n === 1) return 'Mañana'
  if (n === -1) return 'Ayer'
  return n > 0 ? `En ${n} días` : `Hace ${-n} días`
}

/* ---------- Horas ("HH:MM") ---------- */

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

/** 150 → "2 h 30 min"; 45 → "45 min"; 120 → "2 h". */
export function textoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

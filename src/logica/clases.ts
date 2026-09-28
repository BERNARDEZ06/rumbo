import type { Asignatura, Asistencia, BloqueHorario, ClasePuntual, Festivo, PeriodoClases } from '../datos/modelos'
import { aMinutos, diaDeLaSemana, type Dia } from './fechas'

/** Una clase concreta en un día concreto (sale del horario semanal o de una clase puntual). */
export interface ClaseDelDia {
  /** Identifica esta clase en este día: `${fecha}|${idDelBloqueOClase}`. También es el id de su asistencia. */
  id: string
  fecha: Dia
  origen: 'semanal' | 'puntual'
  origenId: string
  asignaturaId: string
  asignatura?: Asignatura
  inicio: string
  fin: string
  aula?: string
  detalle?: string
}

export interface DatosClases {
  horario: BloqueHorario[]
  puntuales: ClasePuntual[]
  festivos: Festivo[]
  asignaturas: Asignatura[]
  periodo: PeriodoClases | null
}

export function idClase(fecha: Dia, origenId: string): string {
  return `${fecha}|${origenId}`
}

export function festivoDe(dia: Dia, festivos: Festivo[]): Festivo | undefined {
  return festivos.find((f) => f.fecha === dia)
}

function seSolapan(a: { inicio: string; fin: string }, b: { inicio: string; fin: string }): boolean {
  return aMinutos(a.inicio) < aMinutos(b.fin) && aMinutos(b.inicio) < aMinutos(a.fin)
}

/**
 * Clases de un día, ordenadas por hora.
 * - En festivos no hay clases.
 * - El horario semanal solo cuenta dentro del periodo del cuatrimestre.
 * - Si una clase puntual de la misma asignatura coincide con una semanal (ej. práctica en lugar de la clase), sustituye a la semanal.
 */
export function clasesDelDia(dia: Dia, datos: DatosClases): ClaseDelDia[] {
  if (festivoDe(dia, datos.festivos)) return []
  const asignatura = (id: string) => datos.asignaturas.find((a) => a.id === id)

  const puntuales: ClaseDelDia[] = datos.puntuales
    .filter((p) => p.fecha === dia)
    .map((p) => ({
      id: idClase(dia, p.id),
      fecha: dia,
      origen: 'puntual',
      origenId: p.id,
      asignaturaId: p.asignaturaId,
      asignatura: asignatura(p.asignaturaId),
      inicio: p.inicio,
      fin: p.fin,
      aula: p.aula,
      detalle: p.detalle,
    }))

  const enPeriodo = datos.periodo !== null && dia >= datos.periodo.desde && dia <= datos.periodo.hasta
  const semanales: ClaseDelDia[] = enPeriodo
    ? datos.horario
        .filter((b) => b.diaSemana === diaDeLaSemana(dia))
        .filter((b) => !puntuales.some((p) => p.asignaturaId === b.asignaturaId && seSolapan(p, b)))
        .map((b) => ({
          id: idClase(dia, b.id),
          fecha: dia,
          origen: 'semanal',
          origenId: b.id,
          asignaturaId: b.asignaturaId,
          asignatura: asignatura(b.asignaturaId),
          inicio: b.inicio,
          fin: b.fin,
          aula: b.aula,
        }))
    : []

  return [...semanales, ...puntuales].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio))
}

/* ---------- Asistencia ---------- */

export type EstadoAsistencia = 'pendiente' | 'asistida' | 'falta'

/**
 * Estado de asistencia de una clase:
 * - Si hay una marca guardada, manda la marca.
 * - Si no, mientras no ha terminado está "pendiente" y, cuando termina, se da por "asistida".
 */
export function estadoAsistencia(clase: ClaseDelDia, marcas: Asistencia[], hoy: Dia, horaActual: string): EstadoAsistencia {
  const marca = marcas.find((m) => m.id === clase.id)
  if (marca) return marca.asistio ? 'asistida' : 'falta'
  const terminada = clase.fecha < hoy || (clase.fecha === hoy && aMinutos(horaActual) >= aMinutos(clase.fin))
  return terminada ? 'asistida' : 'pendiente'
}

export interface ResumenAsistencia {
  asignaturaId: string
  asistidas: number
  total: number
  /** 0-100, o null si aún no ha habido clases. */
  porcentaje: number | null
}

/** Porcentaje de asistencia por asignatura, contando las clases ya terminadas entre dos fechas. */
export function resumenAsistencia(
  datos: DatosClases,
  marcas: Asistencia[],
  desde: Dia,
  hoy: Dia,
  horaActual: string,
  sumarDia: (d: Dia, n: number) => Dia,
): ResumenAsistencia[] {
  const cuentas = new Map<string, { asistidas: number; total: number }>()
  for (let d = desde; d <= hoy; d = sumarDia(d, 1)) {
    for (const clase of clasesDelDia(d, datos)) {
      const estado = estadoAsistencia(clase, marcas, hoy, horaActual)
      if (estado === 'pendiente') continue
      const c = cuentas.get(clase.asignaturaId) ?? { asistidas: 0, total: 0 }
      c.total++
      if (estado === 'asistida') c.asistidas++
      cuentas.set(clase.asignaturaId, c)
    }
  }
  return datos.asignaturas.map((a) => {
    const c = cuentas.get(a.id) ?? { asistidas: 0, total: 0 }
    return { asignaturaId: a.id, ...c, porcentaje: c.total ? Math.round((c.asistidas / c.total) * 100) : null }
  })
}

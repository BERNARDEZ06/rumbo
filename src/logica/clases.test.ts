import { describe, expect, it } from 'vitest'
import type { Asignatura, BloqueHorario, ClasePuntual, Festivo } from '../datos/modelos'
import { clasesDelDia, estadoAsistencia, idClase, resumenAsistencia, type DatosClases } from './clases'
import { sumarDias } from './fechas'

const base = { actualizado: 0 }
const asig = (id: string, nombre: string): Asignatura => ({ ...base, id, nombre, corto: nombre, color: 'indigo' })
const bloque = (id: string, asignaturaId: string, diaSemana: number, inicio: string, fin: string): BloqueHorario => ({
  ...base,
  id,
  asignaturaId,
  diaSemana,
  inicio,
  fin,
})
const puntual = (id: string, asignaturaId: string, fecha: string, inicio: string, fin: string, detalle?: string): ClasePuntual => ({
  ...base,
  id,
  asignaturaId,
  fecha,
  inicio,
  fin,
  detalle,
})
const festivo = (fecha: string): Festivo => ({ ...base, id: fecha, fecha, nombre: 'Festivo' })

const datos: DatosClases = {
  asignaturas: [asig('est', 'Estadística'), asig('mac', 'Macro'), asig('mkt', 'Marketing')],
  horario: [
    bloque('b1', 'mac', 1, '15:00', '16:45'), // lunes
    bloque('b2', 'est', 3, '15:00', '16:45'), // miércoles
    bloque('b3', 'mkt', 3, '17:00', '18:45'), // miércoles
  ],
  puntuales: [
    puntual('p1', 'est', '2026-09-28', '12:30', '14:15', 'Práctica'), // lunes por la mañana
    puntual('p2', 'est', '2026-10-07', '15:00', '16:45', 'Práctica'), // miércoles, en lugar de la clase
  ],
  festivos: [festivo('2026-10-12')],
  periodo: { desde: '2026-09-07', hasta: '2026-12-18' },
}

describe('clases del día', () => {
  it('junta horario semanal y clases puntuales, ordenadas por hora', () => {
    const clases = clasesDelDia('2026-09-28', datos)
    expect(clases.map((c) => [c.inicio, c.asignatura?.nombre, c.origen])).toEqual([
      ['12:30', 'Estadística', 'puntual'],
      ['15:00', 'Macro', 'semanal'],
    ])
    expect(clases[0].detalle).toBe('Práctica')
  })

  it('una práctica a la misma hora sustituye a la clase normal de esa asignatura', () => {
    const clases = clasesDelDia('2026-10-07', datos)
    expect(clases).toHaveLength(2)
    expect(clases[0]).toMatchObject({ origen: 'puntual', detalle: 'Práctica', inicio: '15:00' })
    expect(clases[1]).toMatchObject({ origen: 'semanal', asignaturaId: 'mkt' })
  })

  it('los miércoles sin práctica hay clase normal', () => {
    expect(clasesDelDia('2026-09-30', datos).map((c) => c.origen)).toEqual(['semanal', 'semanal'])
  })

  it('en festivo no hay clases', () => {
    expect(clasesDelDia('2026-10-12', datos)).toEqual([])
  })

  it('fuera del cuatrimestre no hay horario semanal (pero sí clases puntuales)', () => {
    expect(clasesDelDia('2026-12-21', datos)).toEqual([])
    const conPuntualFuera = { ...datos, puntuales: [puntual('p9', 'mac', '2027-01-11', '10:00', '11:00')] }
    expect(clasesDelDia('2027-01-11', conPuntualFuera)).toHaveLength(1)
  })

  it('sin periodo configurado solo hay clases puntuales', () => {
    expect(clasesDelDia('2026-09-28', { ...datos, periodo: null }).map((c) => c.origen)).toEqual(['puntual'])
  })

  it('cada clase de cada día tiene su propio id', () => {
    expect(clasesDelDia('2026-10-05', datos)[0].id).toBe(idClase('2026-10-05', 'b1'))
  })
})

describe('asistencia', () => {
  const [macroLunes] = clasesDelDia('2026-10-05', datos).filter((c) => c.asignaturaId === 'mac')

  it('antes de terminar la clase está pendiente', () => {
    expect(estadoAsistencia(macroLunes, [], '2026-10-05', '16:00')).toBe('pendiente')
    expect(estadoAsistencia(macroLunes, [], '2026-10-04', '20:00')).toBe('pendiente')
  })

  it('al terminar se da por asistida si no se marca nada', () => {
    expect(estadoAsistencia(macroLunes, [], '2026-10-05', '16:45')).toBe('asistida')
    expect(estadoAsistencia(macroLunes, [], '2026-10-06', '09:00')).toBe('asistida')
  })

  it('una falta marcada manda', () => {
    const falta = { ...base, id: macroLunes.id, fecha: macroLunes.fecha, claseId: macroLunes.id, asistio: false }
    expect(estadoAsistencia(macroLunes, [falta], '2026-10-06', '09:00')).toBe('falta')
  })

  it('porcentaje por asignatura con las clases ya terminadas', () => {
    // Lunes 28 sep y 5 oct: Macro; el 5 falta. Hoy 6 oct.
    const falta = { ...base, id: idClase('2026-10-05', 'b1'), fecha: '2026-10-05', claseId: 'x', asistio: false }
    const resumen = resumenAsistencia(datos, [falta], '2026-09-28', '2026-10-06', '10:00', sumarDias)
    expect(resumen.find((r) => r.asignaturaId === 'mac')).toEqual({ asignaturaId: 'mac', asistidas: 1, total: 2, porcentaje: 50 })
    // Estadística: práctica 28 sep + clase 30 sep = 2 de 2
    expect(resumen.find((r) => r.asignaturaId === 'est')?.porcentaje).toBe(100)
  })
})

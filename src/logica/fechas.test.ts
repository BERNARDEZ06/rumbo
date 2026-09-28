import { describe, expect, it } from 'vitest'
import {
  aDia,
  aMinutos,
  deDia,
  diaDeLaSemana,
  diasDeLaSemana,
  diasEntre,
  esDiaValido,
  lunesDe,
  mismoMes,
  semanasDelMes,
  sumarDias,
  sumarMeses,
  textoDuracion,
  textoFechaCorta,
  textoFechaLarga,
  textoMes,
  textoRelativo,
} from './fechas'

describe('conversión de días', () => {
  it('ida y vuelta sin cambiar el día', () => {
    expect(aDia(deDia('2026-09-28'))).toBe('2026-09-28')
    expect(aDia(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01')
  })

  it('valida el formato', () => {
    expect(esDiaValido('2026-09-28')).toBe(true)
    expect(esDiaValido('2026-02-30')).toBe(false)
    expect(esDiaValido('28/09/2026')).toBe(false)
  })
})

describe('sumar días', () => {
  it('cruza meses y años', () => {
    expect(sumarDias('2026-09-30', 1)).toBe('2026-10-01')
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('no se descuadra con el cambio de hora (25 oct y 29 mar)', () => {
    expect(sumarDias('2026-10-24', 1)).toBe('2026-10-25')
    expect(sumarDias('2026-10-25', 1)).toBe('2026-10-26')
    expect(sumarDias('2027-03-28', 1)).toBe('2027-03-29')
    expect(diasEntre('2026-10-20', '2026-10-30')).toBe(10)
  })
})

describe('semanas de lunes a domingo', () => {
  it('lunes = 1 y domingo = 7', () => {
    expect(diaDeLaSemana('2026-09-28')).toBe(1)
    expect(diaDeLaSemana('2026-10-04')).toBe(7)
  })

  it('el lunes de un domingo es el de 6 días antes', () => {
    expect(lunesDe('2026-10-04')).toBe('2026-09-28')
    expect(lunesDe('2026-09-28')).toBe('2026-09-28')
  })

  it('devuelve los 7 días de la semana', () => {
    const semana = diasDeLaSemana('2026-10-01')
    expect(semana).toHaveLength(7)
    expect(semana[0]).toBe('2026-09-28')
    expect(semana[6]).toBe('2026-10-04')
  })
})

describe('cuadrícula del mes', () => {
  it('octubre 2026 empieza el lunes 28 sep y acaba el domingo 1 nov', () => {
    const semanas = semanasDelMes('2026-10-15')
    expect(semanas).toHaveLength(5)
    expect(semanas[0][0]).toBe('2026-09-28')
    expect(semanas.at(-1)!.at(-1)).toBe('2026-11-01')
    semanas.forEach((s) => expect(diaDeLaSemana(s[0])).toBe(1))
  })

  it('cambia de mes', () => {
    expect(sumarMeses('2026-10-15', 1)).toBe('2026-11-01')
    expect(sumarMeses('2026-01-31', -1)).toBe('2025-12-01')
    expect(mismoMes('2026-10-01', '2026-10-31')).toBe(true)
    expect(mismoMes('2026-10-31', '2026-11-01')).toBe(false)
  })
})

describe('textos en español', () => {
  it('fechas', () => {
    expect(textoFechaLarga('2026-09-28')).toBe('lunes, 28 de septiembre')
    expect(textoFechaCorta('2026-10-05')).toMatch(/^lun 5 oct/)
    expect(textoMes('2026-10-05')).toBe('octubre 2026')
  })

  it('relativos para la cuenta atrás', () => {
    expect(textoRelativo('2026-09-28', '2026-09-28')).toBe('Hoy')
    expect(textoRelativo('2026-09-28', '2026-09-29')).toBe('Mañana')
    expect(textoRelativo('2026-09-28', '2026-10-05')).toBe('En 7 días')
    expect(textoRelativo('2026-09-28', '2026-09-25')).toBe('Hace 3 días')
  })

  it('horas y duraciones', () => {
    expect(aMinutos('15:00')).toBe(900)
    expect(textoDuracion(150)).toBe('2 h 30 min')
    expect(textoDuracion(120)).toBe('2 h')
    expect(textoDuracion(45)).toBe('45 min')
  })
})

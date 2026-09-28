import { describe, expect, it } from 'vitest'
import { calcularRacha, cumplidoEnDia, minutosDelDia, progresoSemana, textoMeta, textoRacha } from './habitos'

const diario = { tipo: 'diario' as const, meta: 1 }
const gimnasio = { tipo: 'semanal' as const, meta: 4 }
const estudiar = { tipo: 'tiempo' as const, meta: 120 }

const marcas = (...fechas: string[]) => fechas.map((fecha) => ({ fecha }))
const minutos = (...pares: [string, number][]) => pares.map(([fecha, m]) => ({ fecha, minutos: m }))

describe('cumplido en un día', () => {
  it('diario: basta con marcarlo', () => {
    expect(cumplidoEnDia(diario, marcas('2026-09-28'), '2026-09-28')).toBe(true)
    expect(cumplidoEnDia(diario, marcas('2026-09-28'), '2026-09-29')).toBe(false)
  })

  it('tiempo: hay que llegar a la meta de minutos', () => {
    const r = minutos(['2026-09-28', 90], ['2026-09-29', 120])
    expect(minutosDelDia(r, '2026-09-28')).toBe(90)
    expect(cumplidoEnDia(estudiar, r, '2026-09-28')).toBe(false)
    expect(cumplidoEnDia(estudiar, r, '2026-09-29')).toBe(true)
  })
})

describe('racha diaria', () => {
  it('cuenta los días seguidos hasta hoy', () => {
    const r = marcas('2026-09-26', '2026-09-27', '2026-09-28')
    expect(calcularRacha(diario, r, '2026-09-28')).toEqual({ actual: 3, mejor: 3, unidad: 'días' })
  })

  it('si hoy aún no está hecho, la racha sigue viva desde ayer', () => {
    const r = marcas('2026-09-26', '2026-09-27')
    expect(calcularRacha(diario, r, '2026-09-28').actual).toBe(2)
  })

  it('un día sin hacer rompe la racha, pero se recuerda la mejor', () => {
    const r = marcas('2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-27', '2026-09-28')
    expect(calcularRacha(diario, r, '2026-09-28')).toEqual({ actual: 2, mejor: 4, unidad: 'días' })
  })

  it('sin marcas, racha 0', () => {
    expect(calcularRacha(diario, [], '2026-09-28')).toEqual({ actual: 0, mejor: 0, unidad: 'días' })
  })

  it('en hábitos de tiempo solo cuentan los días que llegan a la meta', () => {
    const r = minutos(['2026-09-26', 120], ['2026-09-27', 60], ['2026-09-28', 150])
    expect(calcularRacha(estudiar, r, '2026-09-28').actual).toBe(1)
  })
})

describe('racha semanal (gimnasio 4 días/semana)', () => {
  // Semanas: 14-20 sep, 21-27 sep, 28 sep-4 oct
  const semanaAnteriorCumplida = marcas('2026-09-21', '2026-09-22', '2026-09-24', '2026-09-26')
  const hace2Cumplida = marcas('2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17')

  it('cuenta semanas seguidas llegando a la meta', () => {
    const r = [...hace2Cumplida, ...semanaAnteriorCumplida]
    expect(calcularRacha(gimnasio, r, '2026-09-28')).toEqual({ actual: 2, mejor: 2, unidad: 'semanas' })
  })

  it('la semana en curso suma en cuanto se cumple', () => {
    const r = [...semanaAnteriorCumplida, ...marcas('2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01')]
    expect(calcularRacha(gimnasio, r, '2026-10-01').actual).toBe(2)
  })

  it('una semana con 3 días rompe la racha', () => {
    const r = [...hace2Cumplida, ...marcas('2026-09-21', '2026-09-22', '2026-09-23')]
    expect(calcularRacha(gimnasio, r, '2026-09-28')).toEqual({ actual: 0, mejor: 1, unidad: 'semanas' })
  })
})

describe('progreso de la semana', () => {
  it('semanal: días hechos frente a la meta', () => {
    const p = progresoSemana(gimnasio, marcas('2026-09-28', '2026-09-30'), '2026-10-01')
    expect(p.hechos).toBe(2)
    expect(p.objetivo).toBe(4)
    expect(p.dias.map((d) => d.cumplido)).toEqual([true, false, true, false, false, false, false])
  })

  it('tiempo: suma los minutos de la semana', () => {
    const p = progresoSemana(estudiar, minutos(['2026-09-28', 120], ['2026-09-29', 45], ['2026-09-21', 300]), '2026-09-29')
    expect(p.minutos).toBe(165)
    expect(p.hechos).toBe(1)
    expect(p.objetivo).toBe(7)
  })
})

describe('textos', () => {
  it('describe la meta', () => {
    expect(textoMeta(diario)).toBe('Cada día')
    expect(textoMeta(gimnasio)).toBe('4 días por semana')
    expect(textoMeta(estudiar)).toBe('2 h al día')
  })

  it('singular y plural de la racha', () => {
    expect(textoRacha(1, 'días')).toBe('1 día')
    expect(textoRacha(1, 'semanas')).toBe('1 semana')
    expect(textoRacha(3, 'semanas')).toBe('3 semanas')
  })
})

describe('horas de estudio por semana con ajustes', () => {
  // 14 h por semana por defecto
  const semanal14 = { tipo: 'tiempo' as const, periodo: 'semana' as const, meta: 840 }

  it('describe la meta semanal', () => {
    expect(textoMeta(semanal14)).toBe('14 h por semana')
  })

  it('los minutos de la semana se comparan con la meta de la semana', () => {
    const r = minutos(['2026-09-28', 300], ['2026-09-30', 240])
    const p = progresoSemana(semanal14, r, '2026-10-01')
    expect(p.minutos).toBe(540)
    expect(p.objetivo).toBe(840)
    expect(p.cumplida).toBe(false)
    expect(p.hechos).toBe(2) // días en los que se estudió algo
  })

  it('una semana ajustada usa su propia meta y la siguiente vuelve a la habitual', () => {
    const ajustado = { ...semanal14, ajustesSemana: { '2026-09-28': 480 } } // 8 h esa semana
    const r = minutos(['2026-09-28', 300], ['2026-09-30', 240])
    const p = progresoSemana(ajustado, r, '2026-10-01')
    expect(p.objetivo).toBe(480)
    expect(p.ajustada).toBe(true)
    expect(p.cumplida).toBe(true)
    expect(progresoSemana(ajustado, r, '2026-10-06').objetivo).toBe(840)
    expect(progresoSemana(ajustado, r, '2026-10-06').ajustada).toBe(false)
  })

  it('racha en semanas, respetando la meta de cada semana', () => {
    const ajustado = { ...semanal14, ajustesSemana: { '2026-09-21': 1200 } } // 20 h semana de exámenes
    const r = minutos(['2026-09-14', 840], ['2026-09-21', 900], ['2026-09-28', 840])
    // 14-20 sep: 14 h ✔ · 21-27 sep: 15 h de 20 ✘ · 28 sep-4 oct: 14 h ✔
    expect(calcularRacha(ajustado, r, '2026-10-01')).toEqual({ actual: 1, mejor: 1, unidad: 'semanas' })
    expect(calcularRacha(semanal14, r, '2026-10-01')).toEqual({ actual: 3, mejor: 3, unidad: 'semanas' })
  })

  it('una semana libre (meta 0) no rompe la racha', () => {
    const conVacaciones = { ...semanal14, ajustesSemana: { '2026-09-21': 0 } }
    const r = minutos(['2026-09-14', 840], ['2026-09-28', 840])
    expect(calcularRacha(conVacaciones, r, '2026-10-01').actual).toBe(3)
  })

  it('el gimnasio también se puede ajustar una semana', () => {
    const gimAjustado = { ...gimnasio, ajustesSemana: { '2026-09-21': 2 } }
    const r = [
      ...marcas('2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17'),
      ...marcas('2026-09-22', '2026-09-24'),
    ]
    expect(calcularRacha(gimAjustado, r, '2026-09-28').actual).toBe(2)
    expect(calcularRacha(gimnasio, r, '2026-09-28').actual).toBe(0)
  })
})

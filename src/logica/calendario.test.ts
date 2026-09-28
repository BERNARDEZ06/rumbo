import { describe, expect, it } from 'vitest'
import type { Evento, Festivo, Tarea } from '../datos/modelos'
import { contenidoDelDia, enCurso } from './calendario'
import { horaActual, textoDiaMes, textoSemana } from './fechas'

const base = { actualizado: 0 }
const tarea = (id: string, fecha: string | undefined, tipo: Tarea['tipo'] = 'otra', hecha: 0 | 1 = 0): Tarea => ({
  ...base,
  id,
  titulo: id,
  tipo,
  fecha,
  hecha,
  creado: 0,
})
const evento = (id: string, fecha: string, inicio?: string): Evento => ({ ...base, id, titulo: id, fecha, inicio })
const festivo: Festivo = { ...base, id: 'f', fecha: '2026-10-12', nombre: 'Fiesta Nacional' }

describe('contenido del día', () => {
  it('reúne tareas, eventos y festivo del día', () => {
    const c = contenidoDelDia(
      '2026-10-05',
      [tarea('entrega', '2026-10-05', 'entrega'), tarea('examen', '2026-10-05', 'examen'), tarea('otro día', '2026-10-06'), tarea('sin fecha', undefined)],
      [evento('dentista', '2026-10-05', '10:00'), evento('cumple', '2026-10-05'), evento('otro', '2026-10-06')],
      [festivo],
    )
    expect(c.tareas.map((t) => t.id)).toEqual(['examen', 'entrega'])
    expect(c.eventos.map((e) => e.id)).toEqual(['cumple', 'dentista']) // sin hora primero (todo el día)
    expect(c.festivo).toBeUndefined()
  })

  it('detecta festivos', () => {
    expect(contenidoDelDia('2026-10-12', [], [], [festivo]).festivo?.nombre).toBe('Fiesta Nacional')
  })
})

describe('clase en curso', () => {
  const clase = { fecha: '2026-10-05', inicio: '15:00', fin: '16:45' }
  it('solo mientras dura', () => {
    expect(enCurso(clase, '2026-10-05', '14:59')).toBe(false)
    expect(enCurso(clase, '2026-10-05', '15:00')).toBe(true)
    expect(enCurso(clase, '2026-10-05', '16:45')).toBe(false)
    expect(enCurso(clase, '2026-10-06', '15:30')).toBe(false)
  })
})

describe('textos del calendario', () => {
  it('día y semana', () => {
    expect(textoDiaMes('2026-10-05')).toBe('5 oct')
    expect(textoSemana('2026-10-01')).toBe('28 sep – 4 oct')
    expect(horaActual(new Date(2026, 9, 5, 9, 7))).toBe('09:07')
  })
})

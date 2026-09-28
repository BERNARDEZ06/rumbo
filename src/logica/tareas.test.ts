import { describe, expect, it } from 'vitest'
import { agruparPendientes, compararTareas, proximosExamenes, tituloFinal, urgencia } from './tareas'

const t = (id: string, fecha?: string, extra: Partial<{ tipo: 'examen' | 'entrega' | 'repaso' | 'otra'; hecha: 0 | 1; hora: string }> = {}) => ({
  id,
  titulo: id,
  tipo: extra.tipo ?? 'otra',
  fecha,
  hora: extra.hora,
  hecha: extra.hecha ?? 0,
})

const HOY = '2026-09-28'

describe('urgencia', () => {
  it('clasifica según la fecha', () => {
    expect(urgencia({ fecha: '2026-09-27' }, HOY)).toBe('atrasada')
    expect(urgencia({ fecha: HOY }, HOY)).toBe('hoy')
    expect(urgencia({ fecha: '2026-10-05' }, HOY)).toBe('pronto') // justo 7 días
    expect(urgencia({ fecha: '2026-10-06' }, HOY)).toBe('adelante')
    expect(urgencia({}, HOY)).toBe('sinFecha')
  })
})

describe('orden y grupos', () => {
  it('ordena por fecha y hora, sin fecha al final', () => {
    const lista = [t('c'), t('b', '2026-10-01', { hora: '18:00' }), t('a', '2026-10-01', { hora: '09:00' }), t('z', '2026-09-30')]
    expect(lista.sort(compararTareas).map((x) => x.id)).toEqual(['z', 'a', 'b', 'c'])
  })

  it('el mismo día, el examen va antes que la entrega', () => {
    const lista = [t('a-entrega', HOY, { tipo: 'entrega' }), t('z-examen', HOY, { tipo: 'examen' })]
    expect(lista.sort(compararTareas).map((x) => x.id)).toEqual(['z-examen', 'a-entrega'])
  })

  it('agrupa solo las pendientes y omite grupos vacíos', () => {
    const grupos = agruparPendientes(
      [t('vieja', '2026-09-20'), t('hoy', HOY), t('hecha', HOY, { hecha: 1 }), t('lejana', '2026-11-01'), t('libre')],
      HOY,
    )
    expect(grupos.map((g) => [g.grupo, g.tareas.map((x) => x.id)])).toEqual([
      ['atrasada', ['vieja']],
      ['hoy', ['hoy']],
      ['adelante', ['lejana']],
      ['sinFecha', ['libre']],
    ])
  })
})

describe('próximos exámenes', () => {
  it('solo exámenes pendientes de hoy en adelante, los más cercanos primero', () => {
    const lista = [
      t('pasado', '2026-09-20', { tipo: 'examen' }),
      t('contabilidad', '2026-10-08', { tipo: 'examen' }),
      t('macro', '2026-10-05', { tipo: 'examen' }),
      t('entrega', '2026-10-01', { tipo: 'entrega' }),
      t('hecho', '2026-10-02', { tipo: 'examen', hecha: 1 }),
      t('marketing', '2026-10-21', { tipo: 'examen' }),
      t('estadistica', '2026-11-04', { tipo: 'examen' }),
    ]
    expect(proximosExamenes(lista, HOY).map((x) => x.id)).toEqual(['macro', 'contabilidad', 'marketing'])
  })
})

describe('título automático', () => {
  it('usa el escrito si lo hay', () => {
    expect(tituloFinal('  Parcial tema 1-3 ', 'examen', { corto: 'Macro' })).toBe('Parcial tema 1-3')
  })

  it('si está vacío, lo compone con el tipo y la asignatura', () => {
    expect(tituloFinal('', 'examen', { corto: 'Macro' })).toBe('Examen de Macro')
    expect(tituloFinal('', 'repaso', { corto: 'Estadística' })).toBe('Repaso de Estadística')
    expect(tituloFinal('', 'otra', { corto: 'Marketing' })).toBe('Tarea de Marketing')
    expect(tituloFinal(' ', 'entrega')).toBe('')
  })
})

import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BaseDeDatos, borrar, guardar, guardarAjuste, leerAjuste, modificar } from './db'

let base: BaseDeDatos

beforeEach(() => {
  base = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
})

afterEach(async () => {
  await base.delete()
})

describe('base de datos', () => {
  it('guarda una tarea con id y hora de cambio', async () => {
    const tarea = await guardar(
      'tareas',
      { titulo: 'Examen Macro', tipo: 'examen', fecha: '2026-10-05', hecha: 0, creado: Date.now() },
      base,
    )
    expect(tarea.id).toMatch(/[0-9a-f-]{36}/)
    expect(tarea.actualizado).toBeGreaterThan(0)
    expect(await base.tareas.get(tarea.id)).toMatchObject({ titulo: 'Examen Macro' })
  })

  it('busca tareas por fecha y por estado', async () => {
    for (const [titulo, fecha, hecha] of [
      ['A', '2026-10-05', 0],
      ['B', '2026-10-08', 1],
      ['C', '2026-10-19', 0],
    ] as const) {
      await guardar('tareas', { titulo, tipo: 'examen', fecha, hecha, creado: 0 }, base)
    }
    const octubrePrimeraQuincena = await base.tareas.where('fecha').between('2026-10-01', '2026-10-15', true, true).toArray()
    expect(octubrePrimeraQuincena.map((t) => t.titulo).sort()).toEqual(['A', 'B'])
    expect(await base.tareas.where('hecha').equals(0).count()).toBe(2)
  })

  it('modifica solo los campos indicados', async () => {
    const t = await guardar('tareas', { titulo: 'Repasar tema 2', tipo: 'repaso', hecha: 0, creado: 0 }, base)
    await modificar('tareas', t.id, { hecha: 1 }, base)
    const cambiada = await base.tareas.get(t.id)
    expect(cambiada).toMatchObject({ titulo: 'Repasar tema 2', hecha: 1 })
    expect(cambiada!.actualizado).toBeGreaterThanOrEqual(t.actualizado)
  })

  it('al borrar deja constancia del borrado', async () => {
    const h = await guardar(
      'habitos',
      { nombre: 'Gimnasio', emoji: '🏋️', color: 'emerald', tipo: 'semanal', meta: 4, orden: 0, archivado: false, creado: '2026-09-28' },
      base,
    )
    await borrar('habitos', h.id, base)
    expect(await base.habitos.get(h.id)).toBeUndefined()
    expect(await base.borrados.get(`habitos|${h.id}`)).toMatchObject({ tabla: 'habitos', registroId: h.id })
  })

  it('busca registros de un hábito en un día', async () => {
    await guardar('registros', { habitoId: 'h1', fecha: '2026-09-28', minutos: 60 }, base)
    await guardar('registros', { habitoId: 'h1', fecha: '2026-09-29', minutos: 30 }, base)
    await guardar('registros', { habitoId: 'h2', fecha: '2026-09-28' }, base)
    const r = await base.registros.where({ habitoId: 'h1', fecha: '2026-09-28' }).toArray()
    expect(r).toHaveLength(1)
    expect(r[0].minutos).toBe(60)
  })

  it('lee y guarda ajustes con valor por defecto', async () => {
    expect(await leerAjuste('datosIniciales', false, base)).toBe(false)
    await guardarAjuste('datosIniciales', true, base)
    expect(await leerAjuste('datosIniciales', false, base)).toBe(true)
  })
})

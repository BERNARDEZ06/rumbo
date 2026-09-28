import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BaseDeDatos } from './db'
import { alternarDia, borrarHabito, crearHabito, fijarMinutos, sumarMinutos } from './habitos'

let base: BaseDeDatos
beforeEach(() => {
  base = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await base.delete()
})

const gimnasio = { nombre: 'Gimnasio', emoji: '🏋️', color: 'emerald', tipo: 'semanal' as const, meta: 4 }
const estudiar = { nombre: 'Estudiar', emoji: '📚', color: 'indigo', tipo: 'tiempo' as const, meta: 120 }

describe('operaciones con hábitos', () => {
  it('los hábitos nuevos van al final de la lista', async () => {
    const a = await crearHabito(gimnasio, '2026-09-28', base)
    const b = await crearHabito(estudiar, '2026-09-28', base)
    expect([a.orden, b.orden]).toEqual([0, 1])
  })

  it('marcar dos veces el mismo día lo desmarca', async () => {
    const h = await crearHabito(gimnasio, '2026-09-28', base)
    expect(await alternarDia(h.id, '2026-09-28', base)).toBe(true)
    expect(await base.registros.count()).toBe(1)
    expect(await alternarDia(h.id, '2026-09-28', base)).toBe(false)
    expect(await base.registros.count()).toBe(0)
  })

  it('suma minutos y nunca baja de cero', async () => {
    const h = await crearHabito(estudiar, '2026-09-28', base)
    expect(await sumarMinutos(h.id, '2026-09-28', 60, base)).toBe(60)
    expect(await sumarMinutos(h.id, '2026-09-28', 45, base)).toBe(105)
    expect(await base.registros.count()).toBe(1)
    expect(await sumarMinutos(h.id, '2026-09-28', -500, base)).toBe(0)
    expect(await base.registros.count()).toBe(0)
  })

  it('fijar minutos sustituye lo apuntado', async () => {
    const h = await crearHabito(estudiar, '2026-09-28', base)
    await fijarMinutos(h.id, '2026-09-28', 90, base)
    await fijarMinutos(h.id, '2026-09-28', 30, base)
    expect((await base.registros.toArray()).map((r) => r.minutos)).toEqual([30])
  })

  it('al borrar un hábito se borran sus marcas', async () => {
    const h = await crearHabito(gimnasio, '2026-09-28', base)
    const otro = await crearHabito(estudiar, '2026-09-28', base)
    await alternarDia(h.id, '2026-09-28', base)
    await alternarDia(h.id, '2026-09-29', base)
    await fijarMinutos(otro.id, '2026-09-28', 60, base)
    await borrarHabito(h.id, base)
    expect(await base.habitos.count()).toBe(1)
    expect(await base.registros.count()).toBe(1)
  })
})

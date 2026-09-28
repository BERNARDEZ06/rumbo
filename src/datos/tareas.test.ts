import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BaseDeDatos } from './db'
import { guardarTarea, marcarTarea } from './tareas'

let base: BaseDeDatos
beforeEach(() => {
  base = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await base.delete()
})

describe('tareas', () => {
  it('no guarda campos vacíos y la hora solo si hay fecha', async () => {
    const t = await guardarTarea({ titulo: 'Leer tema 3', tipo: 'repaso', asignaturaId: '', fecha: '', hora: '10:00', notas: '  ' }, undefined, base)
    expect(t).toMatchObject({ titulo: 'Leer tema 3', hecha: 0 })
    expect(t.fecha).toBeUndefined()
    expect(t.hora).toBeUndefined()
    expect(t.notas).toBeUndefined()
    expect(t.asignaturaId).toBeUndefined()
  })

  it('al editar mantiene si estaba hecha y cuándo se creó', async () => {
    const t = await guardarTarea({ titulo: 'Entrega', tipo: 'entrega', fecha: '2026-10-05' }, undefined, base)
    await marcarTarea(t.id, true, base)
    const hecha = (await base.tareas.get(t.id))!
    const editada = await guardarTarea({ titulo: 'Entrega final', tipo: 'entrega', fecha: '2026-10-06' }, hecha, base)
    expect(editada).toMatchObject({ id: t.id, titulo: 'Entrega final', hecha: 1, creado: t.creado })
    await marcarTarea(t.id, false, base)
    expect((await base.tareas.get(t.id))!.hecha).toBe(0)
  })
})

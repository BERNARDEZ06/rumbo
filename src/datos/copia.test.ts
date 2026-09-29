import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CLAVE_ULTIMA_COPIA, CopiaNoValida, crearCopia, leerCopia, marcarCopiaHecha, nombreArchivo, restaurarCopia, resumenCopia } from './copia'
import { BaseDeDatos, borrar, guardar } from './db'
import { alternarDia } from './habitos'
import { cargarDatosIniciales } from './iniciales'

let origen: BaseDeDatos
let destino: BaseDeDatos
beforeEach(() => {
  origen = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
  destino = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await origen.delete()
  await destino.delete()
})

describe('copia de seguridad', () => {
  it('ida y vuelta: exportar en un dispositivo e importar en otro deja los mismos datos', async () => {
    await cargarDatosIniciales(origen)
    const gim = (await origen.habitos.toArray())[0]
    await alternarDia(gim.id, '2026-09-28', origen)
    await guardar('eventos', { titulo: 'Médico', fecha: '2026-10-07', inicio: '10:00' }, origen)
    const tarea = (await origen.tareas.toArray())[0]
    await borrar('tareas', tarea.id, origen)

    const texto = JSON.stringify(await crearCopia(origen))
    await restaurarCopia(leerCopia(texto), destino)

    for (const t of ['habitos', 'registros', 'asignaturas', 'horario', 'clasesPuntuales', 'festivos', 'tareas', 'eventos', 'borrados'] as const) {
      expect(await destino.table(t).count(), t).toBe(await origen.table(t).count())
    }
    expect(await destino.tareas.count()).toBe(9)
    expect(await destino.borrados.get(`tareas|${tarea.id}`)).toBeTruthy()
    expect((await destino.ajustes.get('clases.periodo'))?.valor).toEqual({ desde: '2026-09-07', hasta: '2026-12-08' })
  })

  it('importar sustituye todo lo que había antes', async () => {
    await guardar('eventos', { titulo: 'Solo en destino', fecha: '2026-10-01' }, destino)
    await guardar('eventos', { titulo: 'De la copia', fecha: '2026-10-02' }, origen)
    await restaurarCopia(await crearCopia(origen), destino)
    expect((await destino.eventos.toArray()).map((e) => e.titulo)).toEqual(['De la copia'])
  })

  it('no incluye la fecha de la última copia', async () => {
    await marcarCopiaHecha(origen)
    const copia = await crearCopia(origen)
    expect((copia.tablas.ajustes as { clave: string }[]).some((a) => a.clave === CLAVE_ULTIMA_COPIA)).toBe(false)
  })

  it('resume lo que contiene', async () => {
    await cargarDatosIniciales(origen)
    const r = resumenCopia(await crearCopia(origen, new Date('2026-09-29T10:00:00Z')))
    expect(r).toMatchObject({ habitos: 2, tareas: 10, asignaturas: 8, eventos: 0 })
    expect(r.fecha.toISOString()).toBe('2026-09-29T10:00:00.000Z')
  })
})

describe('archivos que no son copias', () => {
  it('rechaza texto que no es JSON', () => {
    expect(() => leerCopia('hola')).toThrow(CopiaNoValida)
  })
  it('rechaza JSON de otra cosa', () => {
    expect(() => leerCopia('{"nombre":"otra app"}')).toThrow('no es una copia de seguridad de Rumbo')
  })
  it('rechaza versiones desconocidas y copias dañadas', () => {
    expect(() => leerCopia('{"app":"rumbo","version":9,"tablas":{}}')).toThrow('versión')
    expect(() => leerCopia('{"app":"rumbo","version":1,"tablas":{"tareas":"x"}}')).toThrow('dañada')
  })
  it('nombre del archivo con la fecha', () => {
    expect(nombreArchivo(new Date(2026, 8, 29))).toBe('rumbo-copia-2026-09-29.json')
  })
})

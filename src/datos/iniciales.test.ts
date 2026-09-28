import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clasesDelDia } from '../logica/clases'
import { leerPeriodo } from './clases'
import { BaseDeDatos, borrar } from './db'
import { cargarDatosIniciales } from './iniciales'

let base: BaseDeDatos
beforeEach(() => {
  base = new BaseDeDatos(`prueba-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await base.delete()
})

async function datos() {
  return {
    horario: await base.horario.toArray(),
    puntuales: await base.clasesPuntuales.toArray(),
    festivos: await base.festivos.toArray(),
    asignaturas: await base.asignaturas.toArray(),
    periodo: await leerPeriodo(base),
  }
}

const resumen = (clases: ReturnType<typeof clasesDelDia>) => clases.map((c) => `${c.inicio} ${c.asignatura?.corto}${c.detalle ? ` (${c.detalle})` : ''}`)

describe('datos iniciales del usuario', () => {
  it('carga hábitos, 8 asignaturas, 14 clases semanales, prácticas, Comunicación y festivos', async () => {
    await cargarDatosIniciales(base)
    expect(await base.habitos.count()).toBe(2)
    expect(await base.asignaturas.count()).toBe(8)
    expect(await base.horario.count()).toBe(14)
    expect(await base.clasesPuntuales.count()).toBe(10 + 9)
    expect(await base.festivos.count()).toBe(4)
  })

  it('el lunes 28 de septiembre tiene práctica por la mañana y 3 clases por la tarde', async () => {
    await cargarDatosIniciales(base)
    expect(resumen(clasesDelDia('2026-09-28', await datos()))).toEqual([
      '12:30 Estadística (Práctica)',
      '15:00 Macro',
      '17:00 Bases de Datos',
      '19:00 English',
    ])
  })

  it('el miércoles 14 de octubre la práctica sustituye a la clase de Estadística', async () => {
    await cargarDatosIniciales(base)
    expect(resumen(clasesDelDia('2026-10-14', await datos()))).toEqual([
      '15:00 Estadística (Práctica)',
      '17:00 Marketing',
      '19:00 Regulación',
    ])
  })

  it('los viernes de Comunicación Persuasiva hay clase a las 12:00', async () => {
    await cargarDatosIniciales(base)
    expect(resumen(clasesDelDia('2026-10-02', await datos()))).toEqual([
      '12:00 Comunicación (Grupo 1)',
      '15:00 Marketing',
      '17:00 Macro',
    ])
  })

  it('las clases acaban el 8 de diciembre: el lunes 7 hay clase y el miércoles 9 ya no', async () => {
    await cargarDatosIniciales(base)
    expect(clasesDelDia('2026-12-07', await datos())).toHaveLength(3)
    expect(clasesDelDia('2026-12-08', await datos())).toEqual([])
    expect(clasesDelDia('2026-12-09', await datos())).toEqual([])
  })

  it('el 12 de octubre es festivo y no hay clases', async () => {
    await cargarDatosIniciales(base)
    expect(clasesDelDia('2026-10-12', await datos())).toEqual([])
  })

  it('cargar dos veces no duplica y lo borrado no vuelve', async () => {
    await cargarDatosIniciales(base)
    const unaAsignatura = (await base.asignaturas.toArray())[0]
    await borrar('asignaturas', unaAsignatura.id, base)
    await cargarDatosIniciales(base)
    expect(await base.asignaturas.count()).toBe(7)
    expect(await base.horario.count()).toBe(14)
  })
})

describe('exámenes y entregas iniciales', () => {
  it('carga 9 exámenes y 1 entrega, unidos a su asignatura', async () => {
    await cargarDatosIniciales(base)
    const tareas = await base.tareas.toArray()
    expect(tareas.filter((t) => t.tipo === 'examen')).toHaveLength(9)
    expect(tareas.filter((t) => t.tipo === 'entrega')).toHaveLength(1)
    const macro = await base.asignaturas.filter((a) => a.corto === 'Macro').first()
    expect(tareas.find((t) => t.titulo === 'Examen de Macro')).toMatchObject({ fecha: '2026-10-05', asignaturaId: macro!.id, hecha: 0 })
    expect(tareas.find((t) => t.titulo === 'Bloomberg')?.asignaturaId).toBeUndefined()
  })
})

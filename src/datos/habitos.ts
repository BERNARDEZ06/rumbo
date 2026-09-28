import { idRegistro } from '../logica/habitos'
import type { Dia } from '../logica/fechas'
import { borrar, db, guardar, modificar, type BaseDeDatos } from './db'
import type { Habito } from './modelos'

export type DatosHabito = Pick<Habito, 'nombre' | 'emoji' | 'color' | 'tipo' | 'meta'>

export async function crearHabito(datos: DatosHabito, hoy: Dia, base: BaseDeDatos = db): Promise<Habito> {
  const ultimo = await base.habitos.orderBy('orden').last()
  return guardar('habitos', { ...datos, orden: (ultimo?.orden ?? -1) + 1, archivado: false, creado: hoy }, base)
}

export async function editarHabito(id: string, datos: Partial<DatosHabito & { archivado: boolean }>, base: BaseDeDatos = db) {
  await modificar('habitos', id, datos, base)
}

/** Borra el hábito y todas sus marcas. */
export async function borrarHabito(id: string, base: BaseDeDatos = db): Promise<void> {
  const registros = await base.registros.filter((r) => r.habitoId === id).primaryKeys()
  for (const r of registros) await borrar('registros', r, base)
  await borrar('habitos', id, base)
}

/** Marca o desmarca un día (hábitos diarios y semanales). */
export async function alternarDia(habitoId: string, fecha: Dia, base: BaseDeDatos = db): Promise<boolean> {
  const id = idRegistro(habitoId, fecha)
  if (await base.registros.get(id)) {
    await borrar('registros', id, base)
    return false
  }
  await guardar('registros', { id, habitoId, fecha }, base)
  return true
}

/** Fija los minutos de un día (hábitos de tiempo). Con 0 se quita la marca. */
export async function fijarMinutos(habitoId: string, fecha: Dia, minutos: number, base: BaseDeDatos = db): Promise<void> {
  const id = idRegistro(habitoId, fecha)
  if (minutos <= 0) {
    if (await base.registros.get(id)) await borrar('registros', id, base)
    return
  }
  await guardar('registros', { id, habitoId, fecha, minutos: Math.round(minutos) }, base)
}

/** Suma minutos a los ya apuntados ese día. */
export async function sumarMinutos(habitoId: string, fecha: Dia, minutos: number, base: BaseDeDatos = db): Promise<number> {
  const actual = (await base.registros.get(idRegistro(habitoId, fecha)))?.minutos ?? 0
  const total = Math.max(0, actual + minutos)
  await fijarMinutos(habitoId, fecha, total, base)
  return total
}

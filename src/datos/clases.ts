import { useLiveQuery } from 'dexie-react-hooks'
import type { DatosClases } from '../logica/clases'
import type { Dia } from '../logica/fechas'
import { borrar, db, guardar, guardarAjuste, leerAjuste, type BaseDeDatos } from './db'
import type { PeriodoClases } from './modelos'

const CLAVE_PERIODO = 'clases.periodo'

export function leerPeriodo(base: BaseDeDatos = db): Promise<PeriodoClases | null> {
  return leerAjuste<PeriodoClases | null>(CLAVE_PERIODO, null, base)
}

export function guardarPeriodo(periodo: PeriodoClases, base: BaseDeDatos = db): Promise<void> {
  return guardarAjuste(CLAVE_PERIODO, periodo, base)
}

/** Borra una asignatura junto con sus clases (semanales y puntuales). */
export async function borrarAsignatura(id: string, base: BaseDeDatos = db): Promise<void> {
  for (const b of await base.horario.filter((b) => b.asignaturaId === id).primaryKeys()) await borrar('horario', b, base)
  for (const p of await base.clasesPuntuales.filter((p) => p.asignaturaId === id).primaryKeys()) await borrar('clasesPuntuales', p, base)
  await borrar('asignaturas', id, base)
}

/** Marca si se fue a una clase concreta. Con null se vuelve al comportamiento por defecto. */
export async function marcarAsistencia(claseId: string, fecha: Dia, asistio: boolean | null, base: BaseDeDatos = db): Promise<void> {
  if (asistio === null) {
    if (await base.asistencia.get(claseId)) await borrar('asistencia', claseId, base)
    return
  }
  await guardar('asistencia', { id: claseId, claseId, fecha, asistio }, base)
}

/** Todo lo necesario para saber qué clases hay cada día; se actualiza solo al cambiar los datos. */
export function useDatosClases(): DatosClases | undefined {
  return useLiveQuery(async () => {
    const [horario, puntuales, festivos, asignaturas, periodo] = await Promise.all([
      db.horario.toArray(),
      db.clasesPuntuales.toArray(),
      db.festivos.toArray(),
      db.asignaturas.toArray(),
      leerPeriodo(),
    ])
    asignaturas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    return { horario, puntuales, festivos, asignaturas, periodo }
  }, [])
}

import { db, guardar, modificar, type BaseDeDatos } from './db'
import type { Tarea } from './modelos'

export type DatosTarea = Pick<Tarea, 'titulo' | 'tipo' | 'asignaturaId' | 'fecha' | 'hora' | 'notas'>

/** Crea o actualiza una tarea. Los campos opcionales vacíos no se guardan. */
export async function guardarTarea(datos: DatosTarea, existente?: Tarea, base: BaseDeDatos = db): Promise<Tarea> {
  return guardar(
    'tareas',
    {
      id: existente?.id,
      titulo: datos.titulo,
      tipo: datos.tipo,
      asignaturaId: datos.asignaturaId || undefined,
      fecha: datos.fecha || undefined,
      hora: datos.fecha && datos.hora ? datos.hora : undefined,
      notas: datos.notas?.trim() || undefined,
      hecha: existente?.hecha ?? 0,
      creado: existente?.creado ?? Date.now(),
    },
    base,
  )
}

export async function marcarTarea(id: string, hecha: boolean, base: BaseDeDatos = db): Promise<void> {
  await modificar('tareas', id, { hecha: hecha ? 1 : 0 }, base)
}

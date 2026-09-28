import type { Asignatura, Tarea, TipoTarea } from '../datos/modelos'
import { diasEntre, type Dia } from './fechas'

type TareaMin = Pick<Tarea, 'titulo' | 'tipo' | 'fecha' | 'hora' | 'hecha'> & { id: string }

export const NOMBRE_TIPO: Record<TipoTarea, string> = {
  examen: 'Examen',
  entrega: 'Entrega',
  repaso: 'Repaso',
  otra: 'Tarea',
}

// El mismo día y hora, primero lo más importante.
const PRIORIDAD_TIPO: Record<TipoTarea, number> = { examen: 0, entrega: 1, repaso: 2, otra: 3 }

/** Orden por fecha y hora (y, a igualdad, examen antes que entrega…); las que no tienen fecha, al final. */
export function compararTareas(a: TareaMin, b: TareaMin): number {
  if (a.fecha !== b.fecha) {
    if (!a.fecha) return 1
    if (!b.fecha) return -1
    return a.fecha.localeCompare(b.fecha)
  }
  return (
    (a.hora ?? '99:99').localeCompare(b.hora ?? '99:99') ||
    PRIORIDAD_TIPO[a.tipo] - PRIORIDAD_TIPO[b.tipo] ||
    a.titulo.localeCompare(b.titulo, 'es')
  )
}

export type Urgencia = 'atrasada' | 'hoy' | 'pronto' | 'adelante' | 'sinFecha'

/** Cómo de cerca está una tarea pendiente: atrasada, hoy, en los próximos 7 días, más adelante o sin fecha. */
export function urgencia(tarea: Pick<Tarea, 'fecha'>, hoy: Dia): Urgencia {
  if (!tarea.fecha) return 'sinFecha'
  const dias = diasEntre(hoy, tarea.fecha)
  if (dias < 0) return 'atrasada'
  if (dias === 0) return 'hoy'
  if (dias <= 7) return 'pronto'
  return 'adelante'
}

export const TITULO_GRUPO: Record<Urgencia, string> = {
  atrasada: 'Atrasadas',
  hoy: 'Hoy',
  pronto: 'Próximos 7 días',
  adelante: 'Más adelante',
  sinFecha: 'Sin fecha',
}

const ORDEN_GRUPOS: Urgencia[] = ['atrasada', 'hoy', 'pronto', 'adelante', 'sinFecha']

/** Agrupa las tareas pendientes por urgencia (solo los grupos que tienen algo), cada grupo ordenado por fecha. */
export function agruparPendientes<T extends TareaMin>(tareas: T[], hoy: Dia): { grupo: Urgencia; tareas: T[] }[] {
  const pendientes = tareas.filter((t) => !t.hecha).sort(compararTareas)
  return ORDEN_GRUPOS.map((grupo) => ({ grupo, tareas: pendientes.filter((t) => urgencia(t, hoy) === grupo) })).filter(
    (g) => g.tareas.length > 0,
  )
}

/** Próximos exámenes pendientes (de hoy en adelante), para la cuenta atrás. */
export function proximosExamenes<T extends TareaMin>(tareas: T[], hoy: Dia, cuantos = 3): T[] {
  return tareas
    .filter((t) => t.tipo === 'examen' && !t.hecha && t.fecha && t.fecha >= hoy)
    .sort(compararTareas)
    .slice(0, cuantos)
}

/**
 * Título a guardar: el escrito o, si se deja vacío, uno automático con el tipo y la asignatura
 * (ej. "Examen de Macro"), para apuntar exámenes en dos toques.
 */
export function tituloFinal(titulo: string, tipo: TipoTarea, asignatura?: Pick<Asignatura, 'corto'>): string {
  const limpio = titulo.trim()
  if (limpio) return limpio
  if (!asignatura) return ''
  return `${NOMBRE_TIPO[tipo]} de ${asignatura.corto}`
}

import type { Evento, Festivo, Tarea } from '../datos/modelos'
import { aMinutos, type Dia } from './fechas'
import { compararTareas } from './tareas'

export interface ContenidoDia {
  festivo?: Festivo
  tareas: Tarea[]
  eventos: Evento[]
}

/** Tareas (con fecha ese día), eventos y festivo de un día. Tareas por importancia y hora; eventos por hora. */
export function contenidoDelDia(dia: Dia, tareas: Tarea[], eventos: Evento[], festivos: Festivo[]): ContenidoDia {
  return {
    festivo: festivos.find((f) => f.fecha === dia),
    tareas: tareas.filter((t) => t.fecha === dia).sort(compararTareas),
    eventos: eventos
      .filter((e) => e.fecha === dia)
      .sort((a, b) => (a.inicio ? aMinutos(a.inicio) : -1) - (b.inicio ? aMinutos(b.inicio) : -1) || a.titulo.localeCompare(b.titulo, 'es')),
  }
}

/** ¿Está la clase en curso ahora mismo? */
export function enCurso(clase: { fecha: Dia; inicio: string; fin: string }, hoy: Dia, hora: string): boolean {
  return clase.fecha === hoy && aMinutos(hora) >= aMinutos(clase.inicio) && aMinutos(hora) < aMinutos(clase.fin)
}

import { CalendarDays, Flame, House, ListChecks, Settings, type LucideIcon } from 'lucide-react'

export interface Seccion {
  ruta: string
  nombre: string
  icono: LucideIcon
}

/** Las 5 secciones de la app, en el orden en que aparecen en el menú. */
export const SECCIONES: Seccion[] = [
  { ruta: '/', nombre: 'Hoy', icono: House },
  { ruta: '/calendario', nombre: 'Calendario', icono: CalendarDays },
  { ruta: '/tareas', nombre: 'Tareas', icono: ListChecks },
  { ruta: '/habitos', nombre: 'Hábitos', icono: Flame },
  { ruta: '/ajustes', nombre: 'Ajustes', icono: Settings },
]

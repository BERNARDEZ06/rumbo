import { BookOpen, ClipboardCheck, FileText, GraduationCap, type LucideIcon } from 'lucide-react'
import type { TipoTarea } from '../../datos/modelos'

/** Icono y colores de cada tipo de tarea (rojo examen, verde entrega, como en el calendario del usuario). */
export const ESTILO_TIPO: Record<TipoTarea, { icono: LucideIcon; color: string; etiqueta: string }> = {
  examen: { icono: GraduationCap, color: 'text-red-500 bg-red-500/10', etiqueta: 'text-red-600 bg-red-500/10 dark:text-red-400' },
  entrega: { icono: FileText, color: 'text-emerald-500 bg-emerald-500/10', etiqueta: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400' },
  repaso: { icono: BookOpen, color: 'text-sky-500 bg-sky-500/10', etiqueta: 'text-sky-700 bg-sky-500/10 dark:text-sky-400' },
  otra: { icono: ClipboardCheck, color: 'text-amber-500 bg-amber-500/10', etiqueta: 'text-amber-700 bg-amber-500/10 dark:text-amber-400' },
}

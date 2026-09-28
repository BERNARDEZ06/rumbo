/**
 * Paleta de colores para hábitos y asignaturas.
 * Las clases están escritas enteras para que Tailwind las encuentre.
 */
export const COLORES = {
  indigo: { nombre: 'Índigo', solido: 'bg-indigo-500', suave: 'bg-indigo-500/15', texto: 'text-indigo-600 dark:text-indigo-400', borde: 'border-indigo-500' },
  sky: { nombre: 'Azul', solido: 'bg-sky-500', suave: 'bg-sky-500/15', texto: 'text-sky-600 dark:text-sky-400', borde: 'border-sky-500' },
  teal: { nombre: 'Turquesa', solido: 'bg-teal-500', suave: 'bg-teal-500/15', texto: 'text-teal-600 dark:text-teal-400', borde: 'border-teal-500' },
  emerald: { nombre: 'Verde', solido: 'bg-emerald-500', suave: 'bg-emerald-500/15', texto: 'text-emerald-600 dark:text-emerald-400', borde: 'border-emerald-500' },
  lime: { nombre: 'Lima', solido: 'bg-lime-500', suave: 'bg-lime-500/15', texto: 'text-lime-600 dark:text-lime-400', borde: 'border-lime-500' },
  amber: { nombre: 'Ámbar', solido: 'bg-amber-500', suave: 'bg-amber-500/15', texto: 'text-amber-600 dark:text-amber-400', borde: 'border-amber-500' },
  orange: { nombre: 'Naranja', solido: 'bg-orange-500', suave: 'bg-orange-500/15', texto: 'text-orange-600 dark:text-orange-400', borde: 'border-orange-500' },
  rose: { nombre: 'Rosa', solido: 'bg-rose-500', suave: 'bg-rose-500/15', texto: 'text-rose-600 dark:text-rose-400', borde: 'border-rose-500' },
  fuchsia: { nombre: 'Fucsia', solido: 'bg-fuchsia-500', suave: 'bg-fuchsia-500/15', texto: 'text-fuchsia-600 dark:text-fuchsia-400', borde: 'border-fuchsia-500' },
  violet: { nombre: 'Violeta', solido: 'bg-violet-500', suave: 'bg-violet-500/15', texto: 'text-violet-600 dark:text-violet-400', borde: 'border-violet-500' },
  slate: { nombre: 'Gris', solido: 'bg-slate-500', suave: 'bg-slate-500/15', texto: 'text-slate-600 dark:text-slate-400', borde: 'border-slate-500' },
} as const

export type NombreColor = keyof typeof COLORES

export function color(nombre: string) {
  return COLORES[nombre as NombreColor] ?? COLORES.indigo
}

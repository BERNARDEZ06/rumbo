import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Estilo común de las cajas de texto. */
export const claseInput =
  'w-full min-w-0 rounded-xl border border-borde bg-superficie-2 px-3 py-2.5 text-base outline-none transition placeholder:text-texto-suave/70 focus:border-acento focus:ring-2 focus:ring-acento/20'

type Variante = 'principal' | 'secundario' | 'peligro' | 'fantasma'

const VARIANTES: Record<Variante, string> = {
  principal: 'bg-acento text-acento-texto hover:opacity-90',
  secundario: 'border border-borde bg-superficie hover:bg-superficie-2',
  peligro: 'bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400',
  fantasma: 'text-texto-suave hover:bg-superficie-2 hover:text-texto',
}

export function Boton({
  variante = 'principal',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition active:scale-[0.98] disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...props}
    />
  )
}

export function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-sm font-medium text-texto-suave">{etiqueta}</span>
      {children}
    </label>
  )
}

/** Selector de varias opciones en una barra (como un interruptor múltiple). */
export function Segmentado<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: { valor: T; nombre: string }[]
  valor: T
  onCambio: (v: T) => void
  etiqueta: string
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-superficie-2 p-1">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onCambio(o.valor)}
          className={`rounded-xl px-2 py-2 text-sm font-medium transition ${
            valor === o.valor ? 'bg-superficie text-texto shadow-sm' : 'text-texto-suave hover:text-texto'
          }`}
        >
          {o.nombre}
        </button>
      ))}
    </div>
  )
}

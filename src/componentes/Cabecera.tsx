import type { ReactNode } from 'react'

interface Props {
  titulo: string
  subtitulo?: string
  children?: ReactNode
}

/** Título grande de cada pantalla, con espacio a la derecha para botones. */
export function Cabecera({ titulo, subtitulo, children }: Props) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {subtitulo && <p className="text-sm font-medium text-texto-suave first-letter:uppercase">{subtitulo}</p>}
        <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
      </div>
      {children}
    </header>
  )
}

/** Tarjeta vacía con un mensaje, para secciones que aún no tienen contenido. */
export function Vacio({ icono, titulo, texto }: { icono: ReactNode; titulo: string; texto: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-borde bg-superficie px-6 py-12 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-acento-suave text-acento">{icono}</div>
      <p className="font-semibold">{titulo}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-texto-suave">{texto}</p>
    </div>
  )
}

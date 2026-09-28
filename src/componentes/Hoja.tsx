import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'

interface Props {
  abierta: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

/** Ventana que sube desde abajo en el móvil y aparece centrada en el ordenador. */
export function Hoja({ abierta, titulo, onCerrar, children }: Props) {
  const idTitulo = useId()

  useEffect(() => {
    if (!abierta) return
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', alPulsar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = overflowAnterior
    }
  }, [abierta, onCerrar])

  if (!abierta) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-[aparecer_150ms_ease-out]"
        onClick={onCerrar}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="relative w-full max-w-md rounded-t-3xl border border-borde bg-superficie p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-[subir_200ms_ease-out] md:rounded-3xl md:pb-5"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-borde md:hidden" aria-hidden />
        <div className="mb-4 flex items-center justify-between">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-full text-texto-suave hover:bg-superficie-2"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Dia } from '../logica/fechas'
import { ApuntarMinutos } from './habitos/ApuntarMinutos'

interface Acciones {
  /** Abre la ventana para apuntar tiempo en un hábito y día. */
  apuntarMinutos: (habitoId: string, fecha: Dia) => void
}

const Contexto = createContext<Acciones | null>(null)

/** Ventanas que se pueden abrir desde cualquier pantalla (Hoy, Hábitos, botón "+"…). */
export function ProveedorAcciones({ children }: { children: ReactNode }) {
  const [minutos, setMinutos] = useState<{ habitoId: string; fecha: Dia } | null>(null)
  const apuntarMinutos = useCallback((habitoId: string, fecha: Dia) => setMinutos({ habitoId, fecha }), [])
  const cerrar = useCallback(() => setMinutos(null), [])
  const valor = useMemo(() => ({ apuntarMinutos }), [apuntarMinutos])

  return (
    <Contexto.Provider value={valor}>
      {children}
      <ApuntarMinutos objetivo={minutos} onCerrar={cerrar} />
    </Contexto.Provider>
  )
}

export function useAcciones(): Acciones {
  const acciones = useContext(Contexto)
  if (!acciones) throw new Error('useAcciones debe usarse dentro de ProveedorAcciones')
  return acciones
}

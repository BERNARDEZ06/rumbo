import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Dia } from '../logica/fechas'
import { FormEvento, type AbrirEvento } from './calendario/FormEvento'
import { ApuntarMinutos } from './habitos/ApuntarMinutos'
import { FormTarea, type AbrirTarea } from './tareas/FormTarea'

interface Acciones {
  /** Abre la ventana para apuntar tiempo en un hábito y día. */
  apuntarMinutos: (habitoId: string, fecha: Dia) => void
  /** Abre el formulario de una tarea (nueva o existente). */
  abrirTarea: (opciones: AbrirTarea) => void
  /** Abre el formulario de un evento puntual (nuevo o existente). */
  abrirEvento: (opciones: AbrirEvento) => void
}

const Contexto = createContext<Acciones | null>(null)

/** Ventanas que se pueden abrir desde cualquier pantalla (Hoy, Hábitos, Tareas, botón "+"…). */
export function ProveedorAcciones({ children }: { children: ReactNode }) {
  const [minutos, setMinutos] = useState<{ habitoId: string; fecha: Dia } | null>(null)
  const [tarea, setTarea] = useState<AbrirTarea | null>(null)
  const [evento, setEvento] = useState<AbrirEvento | null>(null)
  const apuntarMinutos = useCallback((habitoId: string, fecha: Dia) => setMinutos({ habitoId, fecha }), [])
  const abrirTarea = useCallback((opciones: AbrirTarea) => setTarea(opciones), [])
  const cerrarMinutos = useCallback(() => setMinutos(null), [])
  const abrirEvento = useCallback((opciones: AbrirEvento) => setEvento(opciones), [])
  const cerrarTarea = useCallback(() => setTarea(null), [])
  const cerrarEvento = useCallback(() => setEvento(null), [])
  const valor = useMemo(() => ({ apuntarMinutos, abrirTarea, abrirEvento }), [apuntarMinutos, abrirTarea, abrirEvento])

  return (
    <Contexto.Provider value={valor}>
      {children}
      <ApuntarMinutos objetivo={minutos} onCerrar={cerrarMinutos} />
      <FormTarea abierta={tarea} onCerrar={cerrarTarea} />
      <FormEvento abierta={evento} onCerrar={cerrarEvento} />
    </Contexto.Provider>
  )
}

export function useAcciones(): Acciones {
  const acciones = useContext(Contexto)
  if (!acciones) throw new Error('useAcciones debe usarse dentro de ProveedorAcciones')
  return acciones
}

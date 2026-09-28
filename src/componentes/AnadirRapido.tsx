import { useLiveQuery } from 'dexie-react-hooks'
import { Timer, type LucideIcon } from 'lucide-react'
import { db } from '../datos/db'
import type { TipoTarea } from '../datos/modelos'
import { hoy } from '../logica/fechas'
import { useAcciones } from './acciones'
import { Hoja } from './Hoja'
import { ESTILO_TIPO } from './tareas/tipos'

interface Opcion {
  nombre: string
  descripcion: string
  icono: LucideIcon
  color: string
  /** Si no tiene acción, se muestra desactivada. */
  accion?: () => void
}

interface Props {
  abierta: boolean
  onCerrar: () => void
}

const TAREAS: [TipoTarea, string, string][] = [
  ['examen', 'Examen', 'Fecha y asignatura'],
  ['entrega', 'Entrega', 'Trabajo con fecha límite'],
  ['repaso', 'Repaso', 'Algo de clase que repasar'],
  ['otra', 'Tarea', 'Cualquier otra cosa'],
]

/** Menú del botón "+": apuntar algo en segundos desde cualquier pantalla. */
export function AnadirRapido({ abierta, onCerrar }: Props) {
  const { apuntarMinutos, abrirTarea } = useAcciones()
  // El primer hábito "por tiempo" activo (ej. Estudiar) recibe las horas de estudio.
  const habitoTiempo = useLiveQuery(
    () => db.habitos.orderBy('orden').filter((h) => h.tipo === 'tiempo' && !h.archivado).first(),
    [],
  )

  const opciones: Opcion[] = [
    ...TAREAS.map(([tipo, nombre, descripcion]) => ({
      nombre,
      descripcion,
      icono: ESTILO_TIPO[tipo].icono,
      color: ESTILO_TIPO[tipo].color,
      accion: () => {
        onCerrar()
        abrirTarea({ tipo })
      },
    })),
    {
      nombre: 'Horas de estudio',
      descripcion: habitoTiempo ? 'Apunta lo que has estudiado hoy' : 'Crea un hábito «por tiempo» primero',
      icono: Timer,
      color: 'text-acento bg-acento-suave',
      accion: habitoTiempo
        ? () => {
            onCerrar()
            apuntarMinutos(habitoTiempo.id, hoy())
          }
        : undefined,
    },
  ]

  return (
    <Hoja abierta={abierta} titulo="Añadir" onCerrar={onCerrar}>
      <ul className="grid gap-2">
        {opciones.map(({ nombre, descripcion, icono: Icono, color, accion }) => (
          <li key={nombre}>
            <button
              type="button"
              disabled={!accion}
              onClick={accion}
              className="flex w-full items-center gap-3 rounded-2xl border border-borde p-3 text-left transition enabled:hover:bg-superficie-2 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{nombre}</span>
                <span className="block text-sm text-texto-suave">{descripcion}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Hoja>
  )
}

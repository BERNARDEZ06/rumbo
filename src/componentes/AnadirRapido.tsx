import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, ClipboardCheck, FileText, GraduationCap, Timer, type LucideIcon } from 'lucide-react'
import { db } from '../datos/db'
import { hoy } from '../logica/fechas'
import { useAcciones } from './acciones'
import { Hoja } from './Hoja'

interface Opcion {
  nombre: string
  descripcion: string
  icono: LucideIcon
  color: string
  /** Si no tiene acción todavía, se muestra como "Pronto". */
  accion?: () => void
}

interface Props {
  abierta: boolean
  onCerrar: () => void
}

/** Menú del botón "+": apuntar algo en segundos desde cualquier pantalla. */
export function AnadirRapido({ abierta, onCerrar }: Props) {
  const { apuntarMinutos } = useAcciones()
  // El primer hábito "por tiempo" activo (ej. Estudiar) recibe las horas de estudio.
  const habitoTiempo = useLiveQuery(
    () => db.habitos.orderBy('orden').filter((h) => h.tipo === 'tiempo' && !h.archivado).first(),
    [],
  )

  const opciones: Opcion[] = [
    { nombre: 'Examen', descripcion: 'Fecha y asignatura', icono: GraduationCap, color: 'text-red-500 bg-red-500/10' },
    { nombre: 'Entrega', descripcion: 'Trabajo con fecha límite', icono: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
    { nombre: 'Repaso', descripcion: 'Algo de clase que repasar', icono: BookOpen, color: 'text-sky-500 bg-sky-500/10' },
    { nombre: 'Tarea', descripcion: 'Cualquier otra cosa', icono: ClipboardCheck, color: 'text-amber-500 bg-amber-500/10' },
    {
      nombre: 'Horas de estudio',
      descripcion: habitoTiempo ? `Apunta lo que has estudiado hoy` : 'Crea un hábito «por tiempo» primero',
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
              className="flex w-full items-center gap-3 rounded-2xl border border-borde p-3 text-left transition enabled:hover:bg-superficie-2 enabled:active:scale-[0.99] disabled:cursor-not-allowed"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{nombre}</span>
                <span className="block text-sm text-texto-suave">{descripcion}</span>
              </span>
              {!accion && <span className="rounded-full bg-superficie-2 px-2 py-0.5 text-xs text-texto-suave">Pronto</span>}
            </button>
          </li>
        ))}
      </ul>
    </Hoja>
  )
}

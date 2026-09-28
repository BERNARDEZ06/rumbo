import { BookOpen, ClipboardCheck, FileText, GraduationCap, Timer, type LucideIcon } from 'lucide-react'
import { Hoja } from './Hoja'

interface Opcion {
  nombre: string
  descripcion: string
  icono: LucideIcon
  color: string
}

const OPCIONES: Opcion[] = [
  { nombre: 'Examen', descripcion: 'Fecha y asignatura', icono: GraduationCap, color: 'text-red-500 bg-red-500/10' },
  { nombre: 'Entrega', descripcion: 'Trabajo con fecha límite', icono: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
  { nombre: 'Repaso', descripcion: 'Algo de clase que repasar', icono: BookOpen, color: 'text-sky-500 bg-sky-500/10' },
  { nombre: 'Tarea', descripcion: 'Cualquier otra cosa', icono: ClipboardCheck, color: 'text-amber-500 bg-amber-500/10' },
  { nombre: 'Horas de estudio', descripcion: 'Apunta lo que has estudiado', icono: Timer, color: 'text-acento bg-acento-suave' },
]

interface Props {
  abierta: boolean
  onCerrar: () => void
}

/** Menú del botón "+": apuntar algo en segundos desde cualquier pantalla. */
export function AnadirRapido({ abierta, onCerrar }: Props) {
  return (
    <Hoja abierta={abierta} titulo="Añadir" onCerrar={onCerrar}>
      <ul className="grid gap-2">
        {OPCIONES.map(({ nombre, descripcion, icono: Icono, color }) => (
          <li key={nombre}>
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-2xl border border-borde p-3 text-left disabled:cursor-not-allowed"
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}>
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{nombre}</span>
                <span className="block text-sm text-texto-suave">{descripcion}</span>
              </span>
              <span className="rounded-full bg-superficie-2 px-2 py-0.5 text-xs text-texto-suave">Pronto</span>
            </button>
          </li>
        ))}
      </ul>
    </Hoja>
  )
}

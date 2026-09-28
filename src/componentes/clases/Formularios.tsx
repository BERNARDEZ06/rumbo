import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { borrarAsignatura } from '../../datos/clases'
import { borrar, guardar } from '../../datos/db'
import type { Asignatura, BloqueHorario, ClasePuntual, Festivo } from '../../datos/modelos'
import { aMinutos, esDiaValido, hoy } from '../../logica/fechas'
import { COLORES, type NombreColor } from '../colores'
import { Hoja } from '../Hoja'
import { Boton, Campo, claseInput } from '../ui'

export const NOMBRES_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/* ---------- Piezas comunes ---------- */

/** Botón de borrar que pide confirmación con un segundo toque. */
export function BotonBorrar({ onBorrar, aviso }: { onBorrar: () => Promise<void>; aviso?: string }) {
  const [confirmar, setConfirmar] = useState(false)
  return (
    <div className="grid grid-cols-1 gap-1">
      <Boton variante="peligro" onClick={() => (confirmar ? onBorrar() : setConfirmar(true))}>
        <Trash2 className="size-4" />
        {confirmar ? '¿Seguro? Borrar' : 'Borrar'}
      </Boton>
      {confirmar && aviso && <p className="text-center text-xs text-texto-suave">{aviso}</p>}
    </div>
  )
}

function Formulario({
  abierta,
  titulo,
  onCerrar,
  onGuardar,
  valido,
  error,
  borrado,
  children,
}: {
  abierta: boolean
  titulo: string
  onCerrar: () => void
  onGuardar: () => Promise<void>
  valido: boolean
  error?: string | null
  borrado?: ReactNode
  children: ReactNode
}) {
  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!valido) return
    await onGuardar()
    onCerrar()
  }
  return (
    <Hoja abierta={abierta} titulo={titulo} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="grid grid-cols-1 gap-4">
        {children}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Boton type="submit" disabled={!valido} className="w-full">
          Guardar
        </Boton>
        {borrado}
      </form>
    </Hoja>
  )
}

function SelectorAsignatura({ asignaturas, valor, onCambio }: { asignaturas: Asignatura[]; valor: string; onCambio: (id: string) => void }) {
  return (
    <Campo etiqueta="Asignatura">
      <select className={claseInput} value={valor} onChange={(e) => onCambio(e.target.value)}>
        <option value="" disabled>
          Elige una asignatura
        </option>
        {asignaturas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre}
          </option>
        ))}
      </select>
    </Campo>
  )
}

function Horas({ inicio, fin, onCambio }: { inicio: string; fin: string; onCambio: (c: { inicio?: string; fin?: string }) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Campo etiqueta="Empieza">
        <input type="time" className={claseInput} value={inicio} onChange={(e) => onCambio({ inicio: e.target.value })} required />
      </Campo>
      <Campo etiqueta="Termina">
        <input type="time" className={claseInput} value={fin} onChange={(e) => onCambio({ fin: e.target.value })} required />
      </Campo>
    </div>
  )
}

function errorHoras(inicio: string, fin: string): string | null {
  if (!inicio || !fin) return null
  return aMinutos(fin) <= aMinutos(inicio) ? 'La hora de fin tiene que ser posterior a la de inicio.' : null
}

/** Mantiene el estado del formulario y lo reinicia cada vez que se abre. */
function useEstado<T>(abierta: boolean, inicial: () => T) {
  const [estado, setEstado] = useState<T>(inicial)
  useEffect(() => {
    if (abierta) setEstado(inicial())
  }, [abierta])
  const cambiar = (c: Partial<T>) => setEstado((e) => ({ ...e, ...c }))
  return [estado, cambiar] as const
}

/* ---------- Asignatura ---------- */

export function FormAsignatura({ abierta, onCerrar, asignatura }: { abierta: boolean; onCerrar: () => void; asignatura?: Asignatura }) {
  const [d, cambiar] = useEstado(abierta, () => ({
    nombre: asignatura?.nombre ?? '',
    corto: asignatura?.corto ?? '',
    color: asignatura?.color ?? 'indigo',
  }))
  const valido = d.nombre.trim() !== ''

  return (
    <Formulario
      abierta={abierta}
      titulo={asignatura ? 'Editar asignatura' : 'Nueva asignatura'}
      onCerrar={onCerrar}
      valido={valido}
      onGuardar={async () => {
        const nombre = d.nombre.trim()
        await guardar('asignaturas', { id: asignatura?.id, nombre, corto: d.corto.trim() || nombre, color: d.color })
      }}
      borrado={
        asignatura && (
          <BotonBorrar
            aviso="Se borrarán también sus clases del horario y sus clases puntuales."
            onBorrar={async () => {
              await borrarAsignatura(asignatura.id)
              onCerrar()
            }}
          />
        )
      }
    >
      <Campo etiqueta="Nombre">
        <input className={claseInput} value={d.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} placeholder="Ej. Macroeconomía" maxLength={60} />
      </Campo>
      <Campo etiqueta="Nombre corto (para el calendario)">
        <input className={claseInput} value={d.corto} onChange={(e) => cambiar({ corto: e.target.value })} placeholder="Ej. Macro" maxLength={16} />
      </Campo>
      <div className="grid grid-cols-1 gap-1.5">
        <span className="text-sm font-medium text-texto-suave">Color</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(COLORES) as NombreColor[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-label={COLORES[c].nombre}
              aria-pressed={d.color === c}
              onClick={() => cambiar({ color: c })}
              className={`size-8 rounded-full ${COLORES[c].solido} ${d.color === c ? 'ring-2 ring-texto ring-offset-2 ring-offset-superficie' : ''}`}
            />
          ))}
        </div>
      </div>
    </Formulario>
  )
}

/* ---------- Clase semanal ---------- */

export function FormBloque({
  abierta,
  onCerrar,
  bloque,
  asignaturas,
}: {
  abierta: boolean
  onCerrar: () => void
  bloque?: BloqueHorario
  asignaturas: Asignatura[]
}) {
  const [d, cambiar] = useEstado(abierta, () => ({
    asignaturaId: bloque?.asignaturaId ?? '',
    diaSemana: bloque?.diaSemana ?? 1,
    inicio: bloque?.inicio ?? '15:00',
    fin: bloque?.fin ?? '16:45',
    aula: bloque?.aula ?? '',
  }))
  const error = errorHoras(d.inicio, d.fin)
  const valido = d.asignaturaId !== '' && !!d.inicio && !!d.fin && !error

  return (
    <Formulario
      abierta={abierta}
      titulo={bloque ? 'Editar clase semanal' : 'Nueva clase semanal'}
      onCerrar={onCerrar}
      valido={valido}
      error={error}
      onGuardar={async () => {
        await guardar('horario', { id: bloque?.id, ...d, aula: d.aula.trim() || undefined })
      }}
      borrado={
        bloque && (
          <BotonBorrar
            onBorrar={async () => {
              await borrar('horario', bloque.id)
              onCerrar()
            }}
          />
        )
      }
    >
      <SelectorAsignatura asignaturas={asignaturas} valor={d.asignaturaId} onCambio={(asignaturaId) => cambiar({ asignaturaId })} />
      <Campo etiqueta="Día">
        <select className={claseInput} value={d.diaSemana} onChange={(e) => cambiar({ diaSemana: Number(e.target.value) })}>
          {NOMBRES_DIAS.map((n, i) => (
            <option key={n} value={i + 1}>
              {n}
            </option>
          ))}
        </select>
      </Campo>
      <Horas inicio={d.inicio} fin={d.fin} onCambio={cambiar} />
      <Campo etiqueta="Aula (opcional)">
        <input className={claseInput} value={d.aula} onChange={(e) => cambiar({ aula: e.target.value })} placeholder="Ej. O-201C" maxLength={30} />
      </Campo>
    </Formulario>
  )
}

/* ---------- Clase puntual ---------- */

export function FormPuntual({
  abierta,
  onCerrar,
  clase,
  asignaturas,
}: {
  abierta: boolean
  onCerrar: () => void
  clase?: ClasePuntual
  asignaturas: Asignatura[]
}) {
  const [d, cambiar] = useEstado(abierta, () => ({
    asignaturaId: clase?.asignaturaId ?? '',
    fecha: clase?.fecha ?? hoy(),
    inicio: clase?.inicio ?? '12:00',
    fin: clase?.fin ?? '13:30',
    detalle: clase?.detalle ?? '',
    aula: clase?.aula ?? '',
  }))
  const error = errorHoras(d.inicio, d.fin)
  const valido = d.asignaturaId !== '' && esDiaValido(d.fecha) && !error

  return (
    <Formulario
      abierta={abierta}
      titulo={clase ? 'Editar clase puntual' : 'Nueva clase puntual'}
      onCerrar={onCerrar}
      valido={valido}
      error={error}
      onGuardar={async () => {
        await guardar('clasesPuntuales', {
          id: clase?.id,
          ...d,
          detalle: d.detalle.trim() || undefined,
          aula: d.aula.trim() || undefined,
        })
      }}
      borrado={
        clase && (
          <BotonBorrar
            onBorrar={async () => {
              await borrar('clasesPuntuales', clase.id)
              onCerrar()
            }}
          />
        )
      }
    >
      <SelectorAsignatura asignaturas={asignaturas} valor={d.asignaturaId} onCambio={(asignaturaId) => cambiar({ asignaturaId })} />
      <Campo etiqueta="Fecha">
        <input type="date" className={claseInput} value={d.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} required />
      </Campo>
      <Horas inicio={d.inicio} fin={d.fin} onCambio={cambiar} />
      <Campo etiqueta="Detalle (opcional)">
        <input className={claseInput} value={d.detalle} onChange={(e) => cambiar({ detalle: e.target.value })} placeholder="Ej. Práctica" maxLength={40} />
      </Campo>
      <Campo etiqueta="Aula (opcional)">
        <input className={claseInput} value={d.aula} onChange={(e) => cambiar({ aula: e.target.value })} maxLength={30} />
      </Campo>
    </Formulario>
  )
}

/* ---------- Festivo ---------- */

export function FormFestivo({ abierta, onCerrar, festivo }: { abierta: boolean; onCerrar: () => void; festivo?: Festivo }) {
  const [d, cambiar] = useEstado(abierta, () => ({ fecha: festivo?.fecha ?? hoy(), nombre: festivo?.nombre ?? '' }))
  const valido = esDiaValido(d.fecha)

  return (
    <Formulario
      abierta={abierta}
      titulo={festivo ? 'Editar festivo' : 'Nuevo festivo'}
      onCerrar={onCerrar}
      valido={valido}
      onGuardar={async () => {
        await guardar('festivos', { id: festivo?.id, fecha: d.fecha, nombre: d.nombre.trim() || 'Festivo' })
      }}
      borrado={
        festivo && (
          <BotonBorrar
            onBorrar={async () => {
              await borrar('festivos', festivo.id)
              onCerrar()
            }}
          />
        )
      }
    >
      <Campo etiqueta="Fecha">
        <input type="date" className={claseInput} value={d.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} required />
      </Campo>
      <Campo etiqueta="Nombre (opcional)">
        <input className={claseInput} value={d.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} placeholder="Ej. Puente" maxLength={40} />
      </Campo>
    </Formulario>
  )
}

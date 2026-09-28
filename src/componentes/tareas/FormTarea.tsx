import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState, type FormEvent } from 'react'
import { borrar, db } from '../../datos/db'
import type { Tarea, TipoTarea } from '../../datos/modelos'
import { guardarTarea } from '../../datos/tareas'
import { NOMBRE_TIPO, tituloFinal } from '../../logica/tareas'
import { BotonBorrar } from '../clases/Formularios'
import { Hoja } from '../Hoja'
import { Boton, Campo, claseInput, Segmentado } from '../ui'

const TIPOS: { valor: TipoTarea; nombre: string }[] = (['examen', 'entrega', 'repaso', 'otra'] as TipoTarea[]).map((valor) => ({
  valor,
  nombre: NOMBRE_TIPO[valor],
}))

const PLACEHOLDER: Record<TipoTarea, string> = {
  examen: 'Ej. Parcial temas 1-4',
  entrega: 'Ej. Caso práctico 2',
  repaso: 'Ej. Repasar ejercicios de clase',
  otra: 'Ej. Imprimir apuntes',
}

export interface AbrirTarea {
  /** Tarea a editar; si no hay, se crea una nueva. */
  tarea?: Tarea
  tipo?: TipoTarea
  fecha?: string
}

interface Props {
  abierta: AbrirTarea | null
  onCerrar: () => void
}

export function FormTarea({ abierta, onCerrar }: Props) {
  const asignaturas = useLiveQuery(() => db.asignaturas.toArray().then((l) => l.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))), [])
  const [d, setD] = useState({ titulo: '', tipo: 'examen' as TipoTarea, asignaturaId: '', fecha: '', hora: '', notas: '' })
  const tarea = abierta?.tarea

  useEffect(() => {
    if (!abierta) return
    const t = abierta.tarea
    setD({
      titulo: t?.titulo ?? '',
      tipo: t?.tipo ?? abierta.tipo ?? 'examen',
      asignaturaId: t?.asignaturaId ?? '',
      fecha: t?.fecha ?? abierta.fecha ?? '',
      hora: t?.hora ?? '',
      notas: t?.notas ?? '',
    })
  }, [abierta])

  const cambiar = (c: Partial<typeof d>) => setD((x) => ({ ...x, ...c }))
  const asignatura = asignaturas?.find((a) => a.id === d.asignaturaId)
  const titulo = tituloFinal(d.titulo, d.tipo, asignatura)
  const valido = titulo !== ''

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!valido) return
    await guardarTarea({ ...d, titulo }, tarea)
    onCerrar()
  }

  return (
    <Hoja abierta={abierta !== null} titulo={tarea ? 'Editar' : `Nuevo: ${NOMBRE_TIPO[d.tipo].toLowerCase()}`} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="grid gap-4">
        <Segmentado etiqueta="Tipo" opciones={TIPOS} valor={d.tipo} onCambio={(tipo) => cambiar({ tipo })} />

        <Campo etiqueta="Asignatura">
          <select className={claseInput} value={d.asignaturaId} onChange={(e) => cambiar({ asignaturaId: e.target.value })}>
            <option value="">Sin asignatura</option>
            {asignaturas?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Título">
          <input
            className={claseInput}
            value={d.titulo}
            onChange={(e) => cambiar({ titulo: e.target.value })}
            placeholder={asignatura ? `${tituloFinal('', d.tipo, asignatura)} (automático)` : PLACEHOLDER[d.tipo]}
            maxLength={80}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Fecha">
            <input type="date" className={claseInput} value={d.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} />
          </Campo>
          <Campo etiqueta="Hora (opcional)">
            <input type="time" className={claseInput} value={d.hora} disabled={!d.fecha} onChange={(e) => cambiar({ hora: e.target.value })} />
          </Campo>
        </div>

        <Campo etiqueta="Notas (opcional)">
          <textarea
            className={`${claseInput} min-h-20 resize-y`}
            value={d.notas}
            onChange={(e) => cambiar({ notas: e.target.value })}
            placeholder="Temas que entran, aula, material…"
            maxLength={1000}
          />
        </Campo>

        <Boton type="submit" disabled={!valido} className="w-full">
          {tarea ? 'Guardar cambios' : 'Guardar'}
        </Boton>
        {!valido && <p className="-mt-2 text-center text-xs text-texto-suave">Escribe un título o elige una asignatura.</p>}

        {tarea && (
          <BotonBorrar
            onBorrar={async () => {
              await borrar('tareas', tarea.id)
              onCerrar()
            }}
          />
        )}
      </form>
    </Hoja>
  )
}

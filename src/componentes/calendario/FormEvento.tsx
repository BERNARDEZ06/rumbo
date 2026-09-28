import { useEffect, useState, type FormEvent } from 'react'
import { borrar, guardar } from '../../datos/db'
import type { Evento } from '../../datos/modelos'
import { aMinutos, esDiaValido, hoy } from '../../logica/fechas'
import { BotonBorrar } from '../clases/Formularios'
import { Hoja } from '../Hoja'
import { Boton, Campo, claseInput } from '../ui'

export interface AbrirEvento {
  evento?: Evento
  fecha?: string
}

/** Cosas puntuales de un día: cita médica, cumpleaños, reunión… */
export function FormEvento({ abierta, onCerrar }: { abierta: AbrirEvento | null; onCerrar: () => void }) {
  const [d, setD] = useState({ titulo: '', fecha: '', inicio: '', fin: '', notas: '' })
  const evento = abierta?.evento

  useEffect(() => {
    if (!abierta) return
    const e = abierta.evento
    setD({ titulo: e?.titulo ?? '', fecha: e?.fecha ?? abierta.fecha ?? hoy(), inicio: e?.inicio ?? '', fin: e?.fin ?? '', notas: e?.notas ?? '' })
  }, [abierta])

  const cambiar = (c: Partial<typeof d>) => setD((x) => ({ ...x, ...c }))
  const errorHora = d.inicio && d.fin && aMinutos(d.fin) <= aMinutos(d.inicio) ? 'La hora de fin tiene que ser posterior a la de inicio.' : null
  const valido = d.titulo.trim() !== '' && esDiaValido(d.fecha) && !errorHora

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!valido) return
    await guardar('eventos', {
      id: evento?.id,
      titulo: d.titulo.trim(),
      fecha: d.fecha,
      inicio: d.inicio || undefined,
      fin: d.inicio && d.fin ? d.fin : undefined,
      notas: d.notas.trim() || undefined,
    })
    onCerrar()
  }

  return (
    <Hoja abierta={abierta !== null} titulo={evento ? 'Editar evento' : 'Nuevo evento'} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="grid gap-4">
        <Campo etiqueta="Qué">
          <input className={claseInput} value={d.titulo} onChange={(e) => cambiar({ titulo: e.target.value })} placeholder="Ej. Médico, cumpleaños de Ana…" maxLength={80} />
        </Campo>
        <Campo etiqueta="Fecha">
          <input type="date" className={claseInput} value={d.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} required />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Empieza (opcional)">
            <input type="time" className={claseInput} value={d.inicio} onChange={(e) => cambiar({ inicio: e.target.value })} />
          </Campo>
          <Campo etiqueta="Termina (opcional)">
            <input type="time" className={claseInput} value={d.fin} disabled={!d.inicio} onChange={(e) => cambiar({ fin: e.target.value })} />
          </Campo>
        </div>
        <Campo etiqueta="Notas (opcional)">
          <textarea className={`${claseInput} min-h-16 resize-y`} value={d.notas} onChange={(e) => cambiar({ notas: e.target.value })} maxLength={500} />
        </Campo>
        {errorHora && <p className="text-sm text-red-600 dark:text-red-400">{errorHora}</p>}
        <Boton type="submit" disabled={!valido} className="w-full">
          Guardar
        </Boton>
        {evento && (
          <BotonBorrar
            onBorrar={async () => {
              await borrar('eventos', evento.id)
              onCerrar()
            }}
          />
        )}
      </form>
    </Hoja>
  )
}

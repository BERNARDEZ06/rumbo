import { Archive, ArchiveRestore, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { borrarHabito, crearHabito, editarHabito, type DatosHabito } from '../../datos/habitos'
import type { Habito, PeriodoTiempo, TipoHabito } from '../../datos/modelos'
import { hoy, textoDuracion } from '../../logica/fechas'
import { COLORES, type NombreColor } from '../colores'
import { Hoja } from '../Hoja'
import { Boton, Campo, claseInput, Segmentado } from '../ui'

const EMOJIS = ['📚', '🏋️', '🏃', '🧘', '💧', '📖', '🛏️', '🥗', '🧠', '✍️', '🎧', '🚶', '💊', '🧹', '🎯', '⭐']
const TIPOS: { valor: TipoHabito; nombre: string }[] = [
  { valor: 'diario', nombre: 'Cada día' },
  { valor: 'semanal', nombre: 'Días/semana' },
  { valor: 'tiempo', nombre: 'Por tiempo' },
]
const PERIODOS: { valor: PeriodoTiempo; nombre: string }[] = [
  { valor: 'dia', nombre: 'Al día' },
  { valor: 'semana', nombre: 'A la semana' },
]
const META_POR_DEFECTO: Record<TipoHabito, number> = { diario: 1, semanal: 3, tiempo: 60 }

const VACIO: DatosHabito = { nombre: '', emoji: '⭐', color: 'indigo', tipo: 'diario', meta: 1 }

interface Props {
  abierta: boolean
  onCerrar: () => void
  /** Si se pasa, se edita ese hábito; si no, se crea uno nuevo. */
  habito?: Habito
}

export function FormularioHabito({ abierta, onCerrar, habito }: Props) {
  const [datos, setDatos] = useState<DatosHabito>(VACIO)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  useEffect(() => {
    if (!abierta) return
    setDatos(habito ? { nombre: habito.nombre, emoji: habito.emoji, color: habito.color, tipo: habito.tipo, meta: habito.meta, periodo: habito.periodo } : VACIO)
    setConfirmarBorrado(false)
  }, [abierta, habito])

  const cambiar = (c: Partial<DatosHabito>) => setDatos((d) => ({ ...d, ...c }))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const nombre = datos.nombre.trim()
    if (!nombre) return
    if (habito) await editarHabito(habito.id, { ...datos, nombre })
    else await crearHabito({ ...datos, nombre }, hoy())
    onCerrar()
  }

  const porSemana = datos.tipo === 'tiempo' && datos.periodo === 'semana'
  const pasoMeta = datos.tipo === 'tiempo' ? (porSemana ? 60 : 15) : 1
  const minMeta = datos.tipo === 'tiempo' ? pasoMeta : 1
  const maxMeta = datos.tipo === 'tiempo' ? (porSemana ? 70 * 60 : 720) : 7

  return (
    <Hoja abierta={abierta} titulo={habito ? 'Editar hábito' : 'Nuevo hábito'} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="grid grid-cols-1 gap-4">
        <Campo etiqueta="Nombre">
          <input
            className={claseInput}
            value={datos.nombre}
            onChange={(e) => cambiar({ nombre: e.target.value })}
            placeholder="Ej. Leer, Gimnasio…"
            maxLength={40}
            autoFocus={!habito}
          />
        </Campo>

        <div className="grid grid-cols-1 gap-1.5">
          <span className="text-sm font-medium text-texto-suave">Icono</span>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                aria-label={`Icono ${e}`}
                aria-pressed={datos.emoji === e}
                onClick={() => cambiar({ emoji: e })}
                className={`grid aspect-square place-items-center rounded-xl text-xl transition ${
                  datos.emoji === e ? 'bg-acento-suave ring-2 ring-acento' : 'bg-superficie-2 hover:bg-borde'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <span className="text-sm font-medium text-texto-suave">Color</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COLORES) as NombreColor[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-label={COLORES[c].nombre}
                aria-pressed={datos.color === c}
                onClick={() => cambiar({ color: c })}
                className={`size-8 rounded-full ${COLORES[c].solido} transition ${
                  datos.color === c ? 'ring-2 ring-texto ring-offset-2 ring-offset-superficie' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <span className="text-sm font-medium text-texto-suave">Objetivo</span>
          <Segmentado
            etiqueta="Tipo de objetivo"
            opciones={TIPOS}
            valor={datos.tipo}
            onCambio={(tipo) => cambiar({ tipo, periodo: habito?.tipo === tipo ? habito.periodo : undefined, meta: habito?.tipo === tipo ? habito.meta : META_POR_DEFECTO[tipo] })}
          />
          {datos.tipo === 'tiempo' && (
            <Segmentado
              etiqueta="Periodo"
              opciones={PERIODOS}
              valor={datos.periodo ?? 'dia'}
              onCambio={(periodo) =>
                cambiar({ periodo, meta: habito?.tipo === 'tiempo' && (habito.periodo ?? 'dia') === periodo ? habito.meta : periodo === 'semana' ? 600 : 60 })
              }
            />
          )}
          {datos.tipo !== 'diario' && (
            <div className="mt-1 flex items-center justify-between rounded-2xl border border-borde px-3 py-2">
              <Boton
                variante="fantasma"
                className="size-10 !p-0"
                aria-label="Menos"
                disabled={datos.meta <= minMeta}
                onClick={() => cambiar({ meta: Math.max(minMeta, datos.meta - pasoMeta) })}
              >
                <Minus className="size-5" />
              </Boton>
              <span className="text-center font-semibold" aria-live="polite">
                {datos.tipo === 'semanal'
                  ? `${datos.meta} ${datos.meta === 1 ? 'día' : 'días'} por semana`
                  : `${textoDuracion(datos.meta)} ${porSemana ? 'por semana' : 'al día'}`}
              </span>
              <Boton
                variante="fantasma"
                className="size-10 !p-0"
                aria-label="Más"
                disabled={datos.meta >= maxMeta}
                onClick={() => cambiar({ meta: Math.min(maxMeta, datos.meta + pasoMeta) })}
              >
                <Plus className="size-5" />
              </Boton>
            </div>
          )}
        </div>

        <Boton type="submit" disabled={!datos.nombre.trim()} className="mt-1 w-full">
          {habito ? 'Guardar cambios' : 'Crear hábito'}
        </Boton>

        {habito && (
          <div className="grid grid-cols-2 gap-2">
            <Boton
              variante="secundario"
              onClick={async () => {
                await editarHabito(habito.id, { archivado: !habito.archivado })
                onCerrar()
              }}
            >
              {habito.archivado ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              {habito.archivado ? 'Recuperar' : 'Archivar'}
            </Boton>
            <Boton
              variante="peligro"
              onClick={async () => {
                if (!confirmarBorrado) return setConfirmarBorrado(true)
                await borrarHabito(habito.id)
                onCerrar()
              }}
            >
              <Trash2 className="size-4" />
              {confirmarBorrado ? '¿Seguro? Borrar' : 'Borrar'}
            </Boton>
          </div>
        )}
        {habito && confirmarBorrado && (
          <p className="-mt-2 text-center text-xs text-texto-suave">Se borrará también todo su historial. Archivar lo oculta sin perder nada.</p>
        )}
      </form>
    </Hoja>
  )
}

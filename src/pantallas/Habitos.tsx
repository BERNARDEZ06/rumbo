import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronDown, Flame, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Cabecera, Vacio } from '../componentes/Cabecera'
import { FormularioHabito } from '../componentes/habitos/FormularioHabito'
import { TarjetaHabito } from '../componentes/habitos/TarjetaHabito'
import { Boton } from '../componentes/ui'
import { db } from '../datos/db'
import type { Habito, Registro } from '../datos/modelos'
import { hoy as calcularHoy } from '../logica/fechas'

export default function Habitos() {
  const habitos = useLiveQuery(() => db.habitos.orderBy('orden').toArray(), [])
  const registros = useLiveQuery(() => db.registros.toArray(), [])
  const [formulario, setFormulario] = useState<{ habito?: Habito } | null>(null)
  const [verArchivados, setVerArchivados] = useState(false)
  const hoy = calcularHoy()

  const porHabito = useMemo(() => {
    const mapa = new Map<string, Registro[]>()
    for (const r of registros ?? []) mapa.set(r.habitoId, [...(mapa.get(r.habitoId) ?? []), r])
    return mapa
  }, [registros])

  if (!habitos || !registros) return <Cabecera titulo="Hábitos" />

  const activos = habitos.filter((h) => !h.archivado)
  const archivados = habitos.filter((h) => h.archivado)

  return (
    <>
      <Cabecera titulo="Hábitos">
        <Boton variante="secundario" onClick={() => setFormulario({})} className="!py-2">
          <Plus className="size-4" /> Nuevo
        </Boton>
      </Cabecera>

      {activos.length === 0 ? (
        <Vacio icono={<Flame className="size-6" />} titulo="Sin hábitos" texto="Crea tu primer hábito con el botón «Nuevo»." />
      ) : (
        <div className="grid gap-3">
          {activos.map((h) => (
            <TarjetaHabito key={h.id} habito={h} registros={porHabito.get(h.id) ?? []} hoy={hoy} onEditar={() => setFormulario({ habito: h })} />
          ))}
        </div>
      )}

      {archivados.length > 0 && (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setVerArchivados((v) => !v)}
            className="flex items-center gap-1 text-sm font-medium text-texto-suave"
            aria-expanded={verArchivados}
          >
            <ChevronDown className={`size-4 transition ${verArchivados ? '' : '-rotate-90'}`} />
            Archivados ({archivados.length})
          </button>
          {verArchivados && (
            <ul className="mt-3 grid gap-2">
              {archivados.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setFormulario({ habito: h })}
                    className="flex w-full items-center gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3 text-left opacity-70 hover:opacity-100"
                  >
                    <span className="text-xl">{h.emoji}</span>
                    <span className="font-medium">{h.nombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <FormularioHabito abierta={formulario !== null} habito={formulario?.habito} onCerrar={() => setFormulario(null)} />
    </>
  )
}

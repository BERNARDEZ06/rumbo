import { useLiveQuery } from 'dexie-react-hooks'
import { ListChecks, Plus } from 'lucide-react'
import { useState } from 'react'
import { useAcciones } from '../componentes/acciones'
import { Cabecera, Vacio } from '../componentes/Cabecera'
import { color } from '../componentes/colores'
import { FilaTarea } from '../componentes/tareas/FilaTarea'
import { Boton, Segmentado } from '../componentes/ui'
import { db } from '../datos/db'
import { hoy as calcularHoy } from '../logica/fechas'
import { agruparPendientes, compararTareas, TITULO_GRUPO } from '../logica/tareas'

type Vista = 'pendientes' | 'hechas'

export default function Tareas() {
  const { abrirTarea } = useAcciones()
  const tareas = useLiveQuery(() => db.tareas.toArray(), [])
  const asignaturas = useLiveQuery(() => db.asignaturas.toArray().then((l) => l.sort((a, b) => a.corto.localeCompare(b.corto, 'es'))), [])
  const [vista, setVista] = useState<Vista>('pendientes')
  const [filtro, setFiltro] = useState<string | null>(null)
  const hoy = calcularHoy()

  const cabecera = (
    <Cabecera titulo="Tareas">
      <Boton variante="secundario" onClick={() => abrirTarea({ tipo: 'examen' })} className="!py-2">
        <Plus className="size-4" /> Nueva
      </Boton>
    </Cabecera>
  )
  if (!tareas || !asignaturas) return cabecera

  const asig = (id?: string) => asignaturas.find((a) => a.id === id)
  const filtradas = filtro ? tareas.filter((t) => t.asignaturaId === filtro) : tareas
  const pendientes = filtradas.filter((t) => !t.hecha).length
  const grupos = agruparPendientes(filtradas, hoy)
  const hechas = filtradas.filter((t) => t.hecha).sort((a, b) => -compararTareas(a, b))
  const conTareas = new Set(tareas.map((t) => t.asignaturaId))

  const chip = (activo: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
      activo ? 'border-acento bg-acento-suave text-acento' : 'border-borde bg-superficie text-texto-suave hover:text-texto'
    }`

  return (
    <>
      {cabecera}

      <div className="grid gap-3">
        <Segmentado
          etiqueta="Ver"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: 'pendientes', nombre: `Pendientes (${pendientes})` },
            { valor: 'hechas', nombre: 'Hechas' },
          ]}
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filtrar por asignatura">
          <button type="button" className={chip(filtro === null)} aria-pressed={filtro === null} onClick={() => setFiltro(null)}>
            Todas
          </button>
          {asignaturas
            .filter((a) => conTareas.has(a.id))
            .map((a) => (
              <button
                key={a.id}
                type="button"
                className={`${chip(filtro === a.id)} flex items-center gap-1.5`}
                aria-pressed={filtro === a.id}
                onClick={() => setFiltro(filtro === a.id ? null : a.id)}
              >
                <span className={`size-2 rounded-full ${color(a.color).solido}`} aria-hidden />
                {a.corto}
              </button>
            ))}
        </div>
      </div>

      <div className="mt-5 grid gap-6">
        {vista === 'pendientes' &&
          (grupos.length === 0 ? (
            <Vacio icono={<ListChecks className="size-6" />} titulo="Nada pendiente" texto="Añade exámenes, entregas o repasos con el botón «Nueva» o con el +." />
          ) : (
            grupos.map((g) => (
              <section key={g.grupo} aria-label={TITULO_GRUPO[g.grupo]}>
                <h2
                  className={`mb-2 text-xs font-semibold tracking-wide uppercase ${
                    g.grupo === 'atrasada' ? 'text-red-600 dark:text-red-400' : 'text-texto-suave'
                  }`}
                >
                  {TITULO_GRUPO[g.grupo]} · {g.tareas.length}
                </h2>
                <ul className="grid gap-2">
                  {g.tareas.map((t) => (
                    <FilaTarea key={t.id} tarea={t} asignatura={asig(t.asignaturaId)} hoy={hoy} />
                  ))}
                </ul>
              </section>
            ))
          ))}

        {vista === 'hechas' &&
          (hechas.length === 0 ? (
            <Vacio icono={<ListChecks className="size-6" />} titulo="Aún no hay tareas hechas" texto="Cuando marques una tarea, aparecerá aquí." />
          ) : (
            <ul className="grid gap-2">
              {hechas.map((t) => (
                <FilaTarea key={t.id} tarea={t} asignatura={asig(t.asignaturaId)} hoy={hoy} />
              ))}
            </ul>
          ))}
      </div>
    </>
  )
}

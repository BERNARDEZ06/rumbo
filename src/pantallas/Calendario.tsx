import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Cabecera } from '../componentes/Cabecera'
import { DetalleDia } from '../componentes/calendario/DetalleDia'
import { ResumenAsistencia } from '../componentes/calendario/ResumenAsistencia'
import { VistaMes } from '../componentes/calendario/VistaMes'
import { Segmentado } from '../componentes/ui'
import { useDatosClases } from '../datos/clases'
import { db } from '../datos/db'
import { useAhora } from '../hooks/useAhora'
import { contenidoDelDia } from '../logica/calendario'
import { clasesDelDia } from '../logica/clases'
import { diasDeLaSemana, semanasDelMes, sumarDias, sumarMeses, textoFechaLarga, textoMes, textoSemana, type Dia } from '../logica/fechas'

type Vista = 'mes' | 'semana'
const CLAVE_VISTA = 'rumbo.calendario.vista'

function leerVista(): Vista {
  try {
    return localStorage.getItem(CLAVE_VISTA) === 'semana' ? 'semana' : 'mes'
  } catch {
    return 'mes'
  }
}

export default function Calendario() {
  const { hoy, hora } = useAhora()
  const [vista, setVistaEstado] = useState<Vista>(leerVista)
  const [dia, setDia] = useState<Dia>(hoy)
  const datosClases = useDatosClases()
  const tareas = useLiveQuery(() => db.tareas.toArray(), [])
  const eventos = useLiveQuery(() => db.eventos.toArray(), [])
  const marcas = useLiveQuery(() => db.asistencia.toArray(), [])

  const setVista = (v: Vista) => {
    setVistaEstado(v)
    try {
      localStorage.setItem(CLAVE_VISTA, v)
    } catch {
      // sin almacenamiento: no se recuerda la vista
    }
  }

  // Días con clase del mes visible (para el punto discreto de la vista mes).
  const diasConClase = useMemo(() => {
    const conjunto = new Set<Dia>()
    if (!datosClases) return conjunto
    for (const d of semanasDelMes(dia).flat()) if (clasesDelDia(d, datosClases).length > 0) conjunto.add(d)
    return conjunto
  }, [datosClases, dia])

  const mover = (sentido: 1 | -1) => setDia(vista === 'mes' ? sumarMeses(dia, sentido) : sumarDias(dia, 7 * sentido))
  const titulo = vista === 'mes' ? textoMes(dia) : textoSemana(dia)
  const cargado = datosClases && tareas && eventos && marcas

  return (
    <>
      <Cabecera titulo="Calendario" />

      <div className="mb-4 grid grid-cols-1 gap-3">
        <Segmentado
          etiqueta="Vista"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: 'mes', nombre: 'Mes' },
            { valor: 'semana', nombre: 'Semana' },
          ]}
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label={vista === 'mes' ? 'Mes anterior' : 'Semana anterior'}
            className="grid size-10 place-items-center rounded-xl border border-borde bg-superficie hover:bg-superficie-2"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="text-lg font-semibold first-letter:uppercase" aria-live="polite">
            {titulo}
          </h2>
          <div className="flex items-center gap-2">
            {dia !== hoy && (
              <button type="button" onClick={() => setDia(hoy)} className="rounded-xl border border-borde bg-superficie px-3 py-2 text-sm font-medium hover:bg-superficie-2">
                Hoy
              </button>
            )}
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label={vista === 'mes' ? 'Mes siguiente' : 'Semana siguiente'}
              className="grid size-10 place-items-center rounded-xl border border-borde bg-superficie hover:bg-superficie-2"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {cargado && vista === 'mes' && (
        <>
          <VistaMes
            seleccionado={dia}
            hoy={hoy}
            tareas={tareas}
            asignaturas={datosClases.asignaturas}
            eventos={eventos}
            festivos={datosClases.festivos}
            diasConClase={diasConClase}
            onElegir={setDia}
          />
          <section className="mt-5" aria-label="Día seleccionado">
            <h2 className="mb-2 font-semibold first-letter:uppercase">{dia === hoy ? `Hoy, ${textoFechaLarga(dia)}` : textoFechaLarga(dia)}</h2>
            <DetalleDia
              dia={dia}
              clases={clasesDelDia(dia, datosClases)}
              contenido={contenidoDelDia(dia, tareas, eventos, datosClases.festivos)}
              asignaturas={datosClases.asignaturas}
              marcas={marcas}
              hoy={hoy}
              hora={hora}
            />
          </section>
        </>
      )}

      {cargado && vista === 'semana' && (
        <div className="grid grid-cols-1 gap-5">
          {diasDeLaSemana(dia).map((d) => (
            <section key={d} aria-label={textoFechaLarga(d)}>
              <h2 className={`mb-2 flex items-center gap-2 font-semibold first-letter:uppercase ${d === hoy ? 'text-acento' : ''}`}>
                {textoFechaLarga(d)}
                {d === hoy && <span className="rounded-full bg-acento px-2 py-0.5 text-xs text-acento-texto">Hoy</span>}
              </h2>
              <DetalleDia
                dia={d}
                clases={clasesDelDia(d, datosClases)}
                contenido={contenidoDelDia(d, tareas, eventos, datosClases.festivos)}
                asignaturas={datosClases.asignaturas}
                marcas={marcas}
                hoy={hoy}
                hora={hora}
                compacto
              />
            </section>
          ))}
        </div>
      )}

      {cargado && (
        <div className="mt-6">
          <ResumenAsistencia datos={datosClases} marcas={marcas} hoy={hoy} hora={hora} />
        </div>
      )}
    </>
  )
}

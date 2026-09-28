import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Cabecera } from '../componentes/Cabecera'
import { FormAsignatura, FormBloque, FormFestivo, FormPuntual, NOMBRES_DIAS } from '../componentes/clases/Formularios'
import { color } from '../componentes/colores'
import { Campo, claseInput } from '../componentes/ui'
import { guardarPeriodo, useDatosClases } from '../datos/clases'
import type { Asignatura, BloqueHorario, ClasePuntual, Festivo } from '../datos/modelos'
import { aMinutos, esDiaValido, hoy, textoFechaCorta } from '../logica/fechas'

type Abierto =
  | { tipo: 'asignatura'; asignatura?: Asignatura }
  | { tipo: 'bloque'; bloque?: BloqueHorario }
  | { tipo: 'puntual'; clase?: ClasePuntual }
  | { tipo: 'festivo'; festivo?: Festivo }
  | null

function Seccion({ titulo, descripcion, onAnadir, children }: { titulo: string; descripcion?: string; onAnadir?: () => void; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-borde bg-superficie p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-sm text-texto-suave">{descripcion}</p>}
        </div>
        {onAnadir && (
          <button
            type="button"
            onClick={onAnadir}
            aria-label={`Añadir: ${titulo}`}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-acento-suave text-acento transition hover:opacity-80"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function Fila({ onClick, punto, principal, secundario }: { onClick: () => void; punto?: string; principal: ReactNode; secundario?: ReactNode }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-superficie-2">
        {punto && <span className={`size-2.5 shrink-0 rounded-full ${punto}`} aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{principal}</span>
          {secundario && <span className="block truncate text-sm text-texto-suave">{secundario}</span>}
        </span>
        <ChevronRight className="size-4 shrink-0 text-texto-suave" />
      </button>
    </li>
  )
}

export default function Clases() {
  const datos = useDatosClases()
  const [abierto, setAbierto] = useState<Abierto>(null)
  const [verPasadas, setVerPasadas] = useState(false)
  const cerrar = () => setAbierto(null)
  const dia = hoy()

  const volver = (
    <Link to="/ajustes" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-texto-suave hover:text-texto">
      <ChevronLeft className="size-4" /> Ajustes
    </Link>
  )

  if (!datos) return volver

  const { asignaturas, horario, puntuales, festivos, periodo } = datos
  const asig = (id: string) => asignaturas.find((a) => a.id === id)
  const porHora = <T extends { inicio: string }>(a: T, b: T) => aMinutos(a.inicio) - aMinutos(b.inicio)
  const puntualesVisibles = puntuales
    .filter((p) => verPasadas || p.fecha >= dia)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || porHora(a, b))
  const pasadas = puntuales.filter((p) => p.fecha < dia).length

  return (
    <>
      {volver}
      <Cabecera titulo="Clases" />

      <div className="grid grid-cols-1 gap-4">
        <Seccion titulo="Cuatrimestre" descripcion="El horario semanal se repite entre estas dos fechas.">
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Desde">
              <input
                type="date"
                className={claseInput}
                value={periodo?.desde ?? ''}
                onChange={(e) => esDiaValido(e.target.value) && guardarPeriodo({ desde: e.target.value, hasta: periodo?.hasta ?? e.target.value })}
              />
            </Campo>
            <Campo etiqueta="Hasta">
              <input
                type="date"
                className={claseInput}
                value={periodo?.hasta ?? ''}
                onChange={(e) => esDiaValido(e.target.value) && guardarPeriodo({ desde: periodo?.desde ?? e.target.value, hasta: e.target.value })}
              />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Asignaturas" onAnadir={() => setAbierto({ tipo: 'asignatura' })}>
          <ul className="-mx-2">
            {asignaturas.map((a) => (
              <Fila key={a.id} punto={color(a.color).solido} principal={a.nombre} onClick={() => setAbierto({ tipo: 'asignatura', asignatura: a })} />
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Horario semanal" descripcion="Clases que se repiten cada semana." onAnadir={() => setAbierto({ tipo: 'bloque' })}>
          <div className="grid grid-cols-1 gap-4">
            {NOMBRES_DIAS.map((nombre, i) => {
              const delDia = horario.filter((b) => b.diaSemana === i + 1).sort(porHora)
              if (delDia.length === 0) return null
              return (
                <div key={nombre}>
                  <h3 className="mb-1 text-xs font-semibold tracking-wide text-texto-suave uppercase">{nombre}</h3>
                  <ul className="-mx-2">
                    {delDia.map((b) => {
                      const a = asig(b.asignaturaId)
                      return (
                        <Fila
                          key={b.id}
                          punto={color(a?.color ?? 'slate').solido}
                          principal={a?.corto ?? 'Asignatura borrada'}
                          secundario={`${b.inicio}–${b.fin}${b.aula ? ` · ${b.aula}` : ''}`}
                          onClick={() => setAbierto({ tipo: 'bloque', bloque: b })}
                        />
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </Seccion>

        <Seccion
          titulo="Clases puntuales"
          descripcion="Prácticas, recuperaciones o clases que solo hay algunos días. Si coinciden con una clase normal de la misma asignatura, la sustituyen."
          onAnadir={() => setAbierto({ tipo: 'puntual' })}
        >
          {puntualesVisibles.length === 0 ? (
            <p className="text-sm text-texto-suave">No hay clases puntuales próximas.</p>
          ) : (
            <ul className="-mx-2">
              {puntualesVisibles.map((p) => {
                const a = asig(p.asignaturaId)
                return (
                  <Fila
                    key={p.id}
                    punto={color(a?.color ?? 'slate').solido}
                    principal={`${a?.corto ?? 'Asignatura borrada'}${p.detalle ? ` · ${p.detalle}` : ''}`}
                    secundario={`${textoFechaCorta(p.fecha)} · ${p.inicio}–${p.fin}`}
                    onClick={() => setAbierto({ tipo: 'puntual', clase: p })}
                  />
                )
              })}
            </ul>
          )}
          {pasadas > 0 && (
            <button type="button" onClick={() => setVerPasadas((v) => !v)} className="mt-2 text-sm font-medium text-acento">
              {verPasadas ? 'Ocultar las pasadas' : `Ver también las pasadas (${pasadas})`}
            </button>
          )}
        </Seccion>

        <Seccion titulo="Festivos" descripcion="Días sin clase." onAnadir={() => setAbierto({ tipo: 'festivo' })}>
          <ul className="-mx-2">
            {[...festivos]
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map((f) => (
                <Fila key={f.id} principal={textoFechaCorta(f.fecha)} secundario={f.nombre} onClick={() => setAbierto({ tipo: 'festivo', festivo: f })} />
              ))}
          </ul>
        </Seccion>
      </div>

      <FormAsignatura abierta={abierto?.tipo === 'asignatura'} asignatura={abierto?.tipo === 'asignatura' ? abierto.asignatura : undefined} onCerrar={cerrar} />
      <FormBloque abierta={abierto?.tipo === 'bloque'} bloque={abierto?.tipo === 'bloque' ? abierto.bloque : undefined} asignaturas={asignaturas} onCerrar={cerrar} />
      <FormPuntual abierta={abierto?.tipo === 'puntual'} clase={abierto?.tipo === 'puntual' ? abierto.clase : undefined} asignaturas={asignaturas} onCerrar={cerrar} />
      <FormFestivo abierta={abierto?.tipo === 'festivo'} festivo={abierto?.tipo === 'festivo' ? abierto.festivo : undefined} onCerrar={cerrar} />
    </>
  )
}

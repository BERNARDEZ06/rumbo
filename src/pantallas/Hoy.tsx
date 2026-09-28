import { useLiveQuery } from 'dexie-react-hooks'
import { Coffee, PartyPopper, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Cabecera } from '../componentes/Cabecera'
import { ClaseItem } from '../componentes/calendario/ClaseItem'
import { HabitoHoy } from '../componentes/hoy/HabitoHoy'
import { CuentaAtras } from '../componentes/hoy/CuentaAtras'
import { FilaTarea } from '../componentes/tareas/FilaTarea'
import { useDatosClases } from '../datos/clases'
import { db } from '../datos/db'
import type { Registro } from '../datos/modelos'
import { useAhora } from '../hooks/useAhora'
import { contenidoDelDia } from '../logica/calendario'
import { clasesDelDia } from '../logica/clases'
import { aMinutos, textoFechaLarga } from '../logica/fechas'
import { compararTareas, proximosExamenes } from '../logica/tareas'

function saludo(hora: string): string {
  const m = aMinutos(hora)
  if (m < 6 * 60) return 'Buenas noches'
  if (m < 14 * 60) return 'Buenos días'
  if (m < 21 * 60) return 'Buenas tardes'
  return 'Buenas noches'
}

function Bloque({ titulo, children, extra }: { titulo: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section aria-label={titulo}>
      <h2 className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-texto-suave uppercase">
        {titulo}
        {extra}
      </h2>
      {children}
    </section>
  )
}

function Aviso({ icono, texto }: { icono: ReactNode; texto: string }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-dashed border-borde px-4 py-3 text-sm text-texto-suave">
      {icono}
      {texto}
    </p>
  )
}

export default function Hoy() {
  const { hoy, hora } = useAhora()
  const datosClases = useDatosClases()
  const tareas = useLiveQuery(() => db.tareas.toArray(), [])
  const eventos = useLiveQuery(() => db.eventos.toArray(), [])
  const marcas = useLiveQuery(() => db.asistencia.toArray(), [])
  const habitos = useLiveQuery(() => db.habitos.orderBy('orden').filter((h) => !h.archivado).toArray(), [])
  const registros = useLiveQuery(() => db.registros.toArray(), [])

  const cabecera = <Cabecera titulo="Hoy" subtitulo={`${saludo(hora)} · ${textoFechaLarga(hoy)}`} />
  if (!datosClases || !tareas || !eventos || !marcas || !habitos || !registros) return cabecera

  const asignatura = (id?: string) => datosClases.asignaturas.find((a) => a.id === id)
  const clases = clasesDelDia(hoy, datosClases)
  const { festivo, eventos: eventosHoy } = contenidoDelDia(hoy, tareas, eventos, datosClases.festivos)
  // Para hoy: lo atrasado sin hacer y todo lo de hoy (lo hecho se queda tachado para ver el progreso).
  const paraHoy = tareas.filter((t) => t.fecha && (t.fecha === hoy || (t.fecha < hoy && !t.hecha))).sort(compararTareas)
  const hechasHoy = paraHoy.filter((t) => t.hecha).length
  const examenes = proximosExamenes(tareas, hoy, 3)
  const registrosDe = (id: string) => registros.filter((r: Registro) => r.habitoId === id)
  const clasesPendientes = clases.filter((c) => hora < c.fin).length

  return (
    <>
      {cabecera}

      <div className="grid grid-cols-1 gap-6">
        <CuentaAtras examenes={examenes} asignaturas={datosClases.asignaturas} hoy={hoy} />

        <Bloque titulo="Tareas para hoy" extra={paraHoy.length > 0 && <span className="normal-case">{hechasHoy}/{paraHoy.length} hechas</span>}>
          {paraHoy.length === 0 ? (
            <Aviso icono={<Sparkles className="size-4" />} texto="Nada pendiente para hoy." />
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              {paraHoy.map((t) => (
                <FilaTarea key={t.id} tarea={t} asignatura={asignatura(t.asignaturaId)} hoy={hoy} />
              ))}
            </ul>
          )}
        </Bloque>

        <Bloque
          titulo="Clases"
          extra={clases.length > 0 && <span className="normal-case">{clasesPendientes > 0 ? `${clasesPendientes} por delante` : 'terminadas'}</span>}
        >
          {festivo ? (
            <Aviso icono={<PartyPopper className="size-4 text-violet-500" />} texto={`Festivo · ${festivo.nombre}. ¡Sin clases!`} />
          ) : clases.length === 0 ? (
            <Aviso icono={<Coffee className="size-4" />} texto="Hoy no tienes clase." />
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              {clases.map((c) => (
                <ClaseItem key={c.id} clase={c} marcas={marcas} hoy={hoy} hora={hora} />
              ))}
            </ul>
          )}
        </Bloque>

        {eventosHoy.length > 0 && (
          <Bloque titulo="Eventos">
            <ul className="grid grid-cols-1 gap-2">
              {eventosHoy.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
                  <span className="w-1 self-stretch rounded-full bg-violet-400" aria-hidden />
                  <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">{e.inicio ?? '—'}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{e.titulo}</span>
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        {habitos.length > 0 && (
          <Bloque titulo="Hábitos">
            <ul className="grid grid-cols-1 gap-2">
              {habitos.map((h) => (
                <HabitoHoy key={h.id} habito={h} registros={registrosDe(h.id)} hoy={hoy} />
              ))}
            </ul>
          </Bloque>
        )}
      </div>
    </>
  )
}

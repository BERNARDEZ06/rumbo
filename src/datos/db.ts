import Dexie, { type EntityTable } from 'dexie'
import type {
  Ajuste,
  Asignatura,
  Asistencia,
  BloqueHorario,
  Borrado,
  ClasePuntual,
  Evento,
  Festivo,
  Habito,
  NombreTabla,
  Registro,
  Tarea,
  TiposPorTabla,
} from './modelos'

/** La base de datos de la app, guardada en el propio dispositivo (IndexedDB). */
export class BaseDeDatos extends Dexie {
  habitos!: EntityTable<Habito, 'id'>
  registros!: EntityTable<Registro, 'id'>
  asignaturas!: EntityTable<Asignatura, 'id'>
  horario!: EntityTable<BloqueHorario, 'id'>
  clasesPuntuales!: EntityTable<ClasePuntual, 'id'>
  festivos!: EntityTable<Festivo, 'id'>
  asistencia!: EntityTable<Asistencia, 'id'>
  tareas!: EntityTable<Tarea, 'id'>
  eventos!: EntityTable<Evento, 'id'>
  ajustes!: EntityTable<Ajuste, 'clave'>
  borrados!: EntityTable<Borrado, 'id'>

  constructor(nombre = 'rumbo') {
    super(nombre)
    // Solo se listan los campos por los que se busca; el resto se guarda igualmente.
    this.version(1).stores({
      habitos: 'id, orden',
      registros: 'id, fecha, [habitoId+fecha]',
      asignaturas: 'id',
      horario: 'id, diaSemana',
      clasesPuntuales: 'id, fecha',
      festivos: 'id, fecha',
      asistencia: 'id, fecha',
      tareas: 'id, fecha, hecha, tipo',
      eventos: 'id, fecha',
      ajustes: 'clave',
      borrados: 'id',
    })
  }
}

export const db = new BaseDeDatos()

export function nuevoId(): string {
  return crypto.randomUUID()
}

/* ---------- Avisos de cambios (los usa la sincronización) ---------- */

const oyentesCambio = new Set<(base: BaseDeDatos) => void>()

/** Llama a la función cada vez que se guarda, cambia o borra algo (devuelve cómo dejar de escuchar). */
export function alCambiar(oyente: (base: BaseDeDatos) => void): () => void {
  oyentesCambio.add(oyente)
  return () => oyentesCambio.delete(oyente)
}

function avisarCambio(base: BaseDeDatos) {
  oyentesCambio.forEach((oyente) => oyente(base))
}

/** Ajustes que son solo de este dispositivo: no se sincronizan ni van en las copias de seguridad. */
export function esAjusteLocal(clave: string): boolean {
  return clave.startsWith('sync.') || clave.startsWith('copia.')
}

type SinBase<T> = Omit<T, 'id' | 'actualizado'> & { id?: string }

/** Crea o actualiza un registro, poniendo su id (si es nuevo) y la hora del cambio. */
export async function guardar<N extends NombreTabla>(
  tabla: N,
  datos: SinBase<TiposPorTabla[N]>,
  base: BaseDeDatos = db,
): Promise<TiposPorTabla[N]> {
  const registro = { ...datos, id: datos.id ?? nuevoId(), actualizado: Date.now() } as TiposPorTabla[N]
  await (base.table(tabla) as Dexie.Table<TiposPorTabla[N], string>).put(registro)
  avisarCambio(base)
  return registro
}

/** Cambia solo algunos campos de un registro existente. */
export async function modificar<N extends NombreTabla>(
  tabla: N,
  id: string,
  cambios: Partial<Omit<TiposPorTabla[N], 'id' | 'actualizado'>>,
  base: BaseDeDatos = db,
): Promise<void> {
  await base.table(tabla).update(id, { ...cambios, actualizado: Date.now() })
  avisarCambio(base)
}

/** Borra un registro y deja constancia de ello (para que la sincronización lo borre también en otros dispositivos). */
export async function borrar(tabla: NombreTabla, id: string, base: BaseDeDatos = db): Promise<void> {
  await base.transaction('rw', base.table(tabla), base.borrados, async () => {
    await base.table(tabla).delete(id)
    await base.borrados.put({ id: `${tabla}|${id}`, tabla, registroId: id, cuando: Date.now() })
  })
  avisarCambio(base)
}

export async function leerAjuste<T>(clave: string, porDefecto: T, base: BaseDeDatos = db): Promise<T> {
  const ajuste = await base.ajustes.get(clave)
  return ajuste === undefined ? porDefecto : (ajuste.valor as T)
}

export async function guardarAjuste(clave: string, valor: unknown, base: BaseDeDatos = db): Promise<void> {
  await base.ajustes.put({ clave, valor, actualizado: Date.now() })
  if (!esAjusteLocal(clave)) avisarCambio(base)
}

export async function borrarAjuste(clave: string, base: BaseDeDatos = db): Promise<void> {
  await base.ajustes.delete(clave)
}

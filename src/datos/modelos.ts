import type { Dia } from '../logica/fechas'

/**
 * Campos comunes a todo lo que se guarda.
 * - id: identificador único (texto aleatorio), sirve también para sincronizar entre dispositivos.
 * - actualizado: momento del último cambio (milisegundos), para saber qué versión es más reciente.
 */
export interface Base {
  id: string
  actualizado: number
}

/* ---------- Hábitos ---------- */

export type TipoHabito =
  | 'diario' // cada día
  | 'semanal' // X veces por semana (meta = veces)
  | 'tiempo' // minutos al día (meta = minutos)

export interface Habito extends Base {
  nombre: string
  emoji: string
  color: string
  tipo: TipoHabito
  /** diario: 1 · semanal: veces por semana · tiempo: minutos por día */
  meta: number
  orden: number
  archivado: boolean
  creado: Dia
}

/** Una marca de un hábito en un día. En los de tiempo, "minutos" guarda lo apuntado. */
export interface Registro extends Base {
  habitoId: string
  fecha: Dia
  minutos?: number
}

/* ---------- Clases ---------- */

export interface Asignatura extends Base {
  nombre: string
  /** Nombre corto para el calendario (ej. "Macro"). */
  corto: string
  color: string
}

/** Clase que se repite cada semana. */
export interface BloqueHorario extends Base {
  asignaturaId: string
  /** 1 = lunes … 7 = domingo */
  diaSemana: number
  inicio: string // "15:00"
  fin: string // "16:45"
  aula?: string
  /** Periodo en el que es válida (ej. el cuatrimestre). */
  desde: Dia
  hasta: Dia
}

/** Clase de un día concreto (prácticas, Comunicación Persuasiva…). */
export interface ClasePuntual extends Base {
  asignaturaId: string
  fecha: Dia
  inicio: string
  fin: string
  aula?: string
  /** Texto extra, ej. "Práctica". */
  detalle?: string
}

export interface Festivo extends Base {
  fecha: Dia
  nombre: string
}

/** Excepción de asistencia: por defecto se da por asistida; aquí se guarda si no se fue. */
export interface Asistencia extends Base {
  /** Identifica la clase concreta de un día: `${fecha}|${idDelBloqueOClase}` */
  fecha: Dia
  claseId: string
  asistio: boolean
}

/* ---------- Tareas y eventos ---------- */

export type TipoTarea = 'examen' | 'entrega' | 'repaso' | 'otra'

export interface Tarea extends Base {
  titulo: string
  tipo: TipoTarea
  asignaturaId?: string
  fecha?: Dia
  hora?: string
  notas?: string
  /** 0 = pendiente, 1 = hecha (número para poder buscar por ello). */
  hecha: 0 | 1
  creado: number
}

export interface Evento extends Base {
  titulo: string
  fecha: Dia
  inicio?: string
  fin?: string
  notas?: string
}

/* ---------- Otros ---------- */

export interface Ajuste {
  clave: string
  valor: unknown
}

/** Registro de lo borrado, para que la futura sincronización sepa qué eliminar en el otro dispositivo. */
export interface Borrado {
  id: string // `${tabla}|${idDelRegistro}`
  tabla: NombreTabla
  registroId: string
  cuando: number
}

export const TABLAS = [
  'habitos',
  'registros',
  'asignaturas',
  'horario',
  'clasesPuntuales',
  'festivos',
  'asistencia',
  'tareas',
  'eventos',
] as const

export type NombreTabla = (typeof TABLAS)[number]

export interface TiposPorTabla {
  habitos: Habito
  registros: Registro
  asignaturas: Asignatura
  horario: BloqueHorario
  clasesPuntuales: ClasePuntual
  festivos: Festivo
  asistencia: Asistencia
  tareas: Tarea
  eventos: Evento
}

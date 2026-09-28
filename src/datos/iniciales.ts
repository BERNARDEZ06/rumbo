import { diaDeLaSemana, hoy } from '../logica/fechas'
import { guardarPeriodo } from './clases'
import { db, guardar, guardarAjuste, leerAjuste, nuevoId, type BaseDeDatos } from './db'
import { crearHabito } from './habitos'

/**
 * Carga los datos con los que arranca la app la primera vez (hábitos, horario del usuario…).
 * Cada bloque se carga una sola vez: si luego se borra algo, no vuelve a aparecer.
 */
export async function cargarDatosIniciales(base: BaseDeDatos = db): Promise<void> {
  await unaVez('inicial.habitos', base, () => cargarHabitos(base))
  await unaVez('inicial.horario', base, () => cargarHorario(base))
  await unaVez('inicial.tareas', base, () => cargarTareas(base))
}

async function unaVez(clave: string, base: BaseDeDatos, cargar: () => Promise<void>) {
  if (await leerAjuste(clave, false, base)) return
  // Se marca antes de cargar para no duplicar si la app se abre dos veces a la vez.
  await guardarAjuste(clave, true, base)
  await cargar()
}

async function cargarHabitos(base: BaseDeDatos) {
  if ((await base.habitos.count()) > 0) return
  const dia = hoy()
  await crearHabito({ nombre: 'Gimnasio', emoji: '🏋️', color: 'emerald', tipo: 'semanal', meta: 4 }, dia, base)
  // 14 h por semana (unas 2 h al día), ajustable semana a semana.
  await crearHabito({ nombre: 'Estudiar', emoji: '📚', color: 'indigo', tipo: 'tiempo', periodo: 'semana', meta: 840 }, dia, base)
}

/* ---------- Horario real: 2.º E2A+BA, ICADE, 1.er cuatrimestre 2026/2027 (ver docs/HORARIO.md) ---------- */

const ASIGNATURAS = {
  estadistica: { nombre: 'Estadística y Probabilidad', corto: 'Estadística', color: 'indigo' },
  macro: { nombre: 'Macroeconomía', corto: 'Macro', color: 'rose' },
  bbdd: { nombre: 'Introducción a las Bases de Datos', corto: 'Bases de Datos', color: 'sky' },
  english: { nombre: 'Business English', corto: 'English', color: 'amber' },
  contabilidad: { nombre: 'Contabilidad Financiera', corto: 'Contabilidad', color: 'emerald' },
  marketing: { nombre: 'Fundamentos de Marketing', corto: 'Marketing', color: 'fuchsia' },
  regulacion: { nombre: 'Regulación de Mercados Digitales', corto: 'Regulación', color: 'teal' },
  comunicacion: { nombre: 'Comunicación Persuasiva', corto: 'Comunicación', color: 'orange' },
} as const

type Clave = keyof typeof ASIGNATURAS

// [día (1 = lunes), inicio, fin, asignatura, aula]
const SEMANAL: [number, string, string, Clave, string][] = [
  [1, '15:00', '16:45', 'macro', 'O-201C'],
  [1, '17:00', '18:45', 'bbdd', 'O-201C / O-211'],
  [1, '19:00', '20:45', 'english', 'O-203'],
  [2, '15:00', '16:45', 'contabilidad', 'O-201C'],
  [2, '17:00', '18:45', 'estadistica', 'O-201C'],
  [2, '19:00', '20:45', 'english', 'O-203'],
  [3, '15:00', '16:45', 'estadistica', 'O-201C'],
  [3, '17:00', '18:45', 'marketing', 'O-201C'],
  [3, '19:00', '20:45', 'regulacion', 'O-201C'],
  [4, '15:00', '16:45', 'contabilidad', 'O-201C'],
  [4, '17:00', '18:45', 'bbdd', 'O-201C / O-211'],
  [4, '19:00', '20:45', 'regulacion', 'O-201C'],
  [5, '15:00', '16:45', 'marketing', 'O-201C'],
  [5, '17:00', '18:45', 'macro', 'O-201C'],
]

const COMUNICACION = ['2026-09-11', '2026-09-18', '2026-09-25', '2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06', '2026-11-13']

// Prácticas de Estadística del grupo 1 y de "todos": lunes 12:30-14:15 o miércoles 15:00-16:45.
// (El grupo solo se apunta aquí como referencia; en la app se muestra simplemente "Práctica".)
const PRACTICAS: [string, 'G1' | 'Todos'][] = [
  ['2026-09-28', 'G1'],
  ['2026-10-07', 'G1'],
  ['2026-10-14', 'Todos'],
  ['2026-10-21', 'Todos'],
  ['2026-10-28', 'Todos'],
  ['2026-11-11', 'Todos'],
  ['2026-11-16', 'Todos'],
  ['2026-11-18', 'Todos'],
  ['2026-11-23', 'G1'],
]

const FESTIVOS: [string, string][] = [
  ['2026-10-12', 'Fiesta Nacional de España'],
  ['2026-11-02', 'Todos los Santos (trasladado)'],
  ['2026-11-09', 'La Almudena'],
  ['2026-12-08', 'Inmaculada Concepción'],
]

async function cargarHorario(base: BaseDeDatos) {
  if ((await base.asignaturas.count()) > 0) return

  const ids = {} as Record<Clave, string>
  for (const [clave, datos] of Object.entries(ASIGNATURAS) as [Clave, (typeof ASIGNATURAS)[Clave]][]) {
    ids[clave] = nuevoId()
    await guardar('asignaturas', { id: ids[clave], ...datos }, base)
  }

  for (const [diaSemana, inicio, fin, clave, aula] of SEMANAL) {
    await guardar('horario', { asignaturaId: ids[clave], diaSemana, inicio, fin, aula }, base)
  }

  for (const fecha of COMUNICACION) {
    await guardar('clasesPuntuales', { asignaturaId: ids.comunicacion, fecha, inicio: '12:00', fin: '13:30', aula: 'O-206', detalle: 'Grupo 1' }, base)
  }

  for (const [fecha] of PRACTICAS) {
    const esLunes = diaDeLaSemana(fecha) === 1
    await guardar(
      'clasesPuntuales',
      {
        asignaturaId: ids.estadistica,
        fecha,
        inicio: esLunes ? '12:30' : '15:00',
        fin: esLunes ? '14:15' : '16:45',
        aula: esLunes ? 'O-310' : 'O-201C',
        detalle: 'Práctica',
      },
      base,
    )
  }

  for (const [fecha, nombre] of FESTIVOS) await guardar('festivos', { fecha, nombre }, base)

  // Clases del 7 sep al 8 dic (confirmado por el usuario); se puede cambiar en Ajustes → Clases.
  await guardarPeriodo({ desde: '2026-09-07', hasta: '2026-12-08' }, base)
}

/* ---------- Exámenes y entregas ya conocidos (calendario del usuario) ---------- */

// [fecha, tipo, título, nombre corto de la asignatura o null]
const TAREAS: [string, 'examen' | 'entrega', string, string | null][] = [
  ['2026-10-05', 'examen', 'Examen de Macro', 'Macro'],
  ['2026-10-05', 'entrega', 'Entrega de Macroeconomía', 'Macro'],
  ['2026-10-08', 'examen', 'Examen de Contabilidad', 'Contabilidad'],
  ['2026-10-10', 'examen', 'Mock de Estadística', 'Estadística'],
  ['2026-10-19', 'examen', 'Tratamiento de datos', 'Bases de Datos'],
  ['2026-10-21', 'examen', 'Examen de Marketing', 'Marketing'],
  ['2026-11-04', 'examen', 'Examen de Estadística', 'Estadística'],
  ['2026-11-05', 'examen', 'Examen de Contabilidad', 'Contabilidad'],
  ['2026-11-28', 'examen', 'AI Estadística', 'Estadística'],
  ['2026-12-03', 'examen', 'Bloomberg', null],
]

async function cargarTareas(base: BaseDeDatos) {
  if ((await base.tareas.count()) > 0) return
  const asignaturas = await base.asignaturas.toArray()
  const creado = Date.now()
  for (const [fecha, tipo, titulo, corto] of TAREAS) {
    const asignaturaId = corto ? asignaturas.find((a) => a.corto === corto)?.id : undefined
    await guardar('tareas', { titulo, tipo, fecha, asignaturaId, hecha: 0, creado }, base)
  }
}

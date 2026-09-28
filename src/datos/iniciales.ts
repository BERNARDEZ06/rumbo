import { hoy } from '../logica/fechas'
import { db, guardarAjuste, leerAjuste, type BaseDeDatos } from './db'
import { crearHabito } from './habitos'

/**
 * Carga los datos con los que arranca la app la primera vez (hábitos del usuario, más adelante su horario).
 * Cada bloque se carga una sola vez: si luego se borra algo, no vuelve a aparecer.
 */
export async function cargarDatosIniciales(base: BaseDeDatos = db): Promise<void> {
  if (!(await leerAjuste('inicial.habitos', false, base))) {
    // Se marca antes de crear para no duplicar si la app se abre dos veces a la vez.
    await guardarAjuste('inicial.habitos', true, base)
    if ((await base.habitos.count()) === 0) {
      const dia = hoy()
      await crearHabito({ nombre: 'Gimnasio', emoji: '🏋️', color: 'emerald', tipo: 'semanal', meta: 4 }, dia, base)
      await crearHabito({ nombre: 'Estudiar', emoji: '📚', color: 'indigo', tipo: 'tiempo', meta: 120 }, dia, base)
    }
  }
}

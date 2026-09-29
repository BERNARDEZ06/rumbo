import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BaseDeDatos, borrar, guardar, guardarAjuste } from '../db'
import { alternarDia } from '../habitos'
import { cargarDatosIniciales } from '../iniciales'
import { marcarTarea } from '../tareas'
import { ConflictoRemoto, type Remoto } from './github'
import { sincronizarCon } from './motor'

/** Un "GitHub" en memoria: guarda el texto y su versión, y rechaza escrituras con una versión vieja. */
function remotoEnMemoria() {
  let archivo: { texto: string; sha: string } | null = null
  let version = 0
  let conflictosPendientes = 0
  const remoto: Remoto = {
    async leer() {
      return archivo ? { ...archivo } : null
    },
    async escribir(texto, sha) {
      if (conflictosPendientes > 0) {
        conflictosPendientes--
        archivo = archivo && { ...archivo, sha: `otra-${++version}` }
        throw new ConflictoRemoto()
      }
      if ((archivo?.sha ?? null) !== sha) throw new ConflictoRemoto()
      archivo = { texto, sha: `v${++version}` }
      return archivo.sha
    },
  }
  return {
    remoto,
    texto: () => archivo?.texto ?? '',
    forzarConflictos: (n: number) => {
      conflictosPendientes = n
    },
  }
}

let movil: BaseDeDatos
let ordenador: BaseDeDatos
beforeEach(() => {
  movil = new BaseDeDatos(`movil-${crypto.randomUUID()}`)
  ordenador = new BaseDeDatos(`ordenador-${crypto.randomUUID()}`)
})
afterEach(async () => {
  await movil.delete()
  await ordenador.delete()
})

const titulos = async (b: BaseDeDatos) => (await b.tareas.toArray()).map((t) => t.titulo).sort()

describe('sincronizar móvil y ordenador', () => {
  it('lo que se apunta en el móvil aparece en el ordenador', async () => {
    const nube = remotoEnMemoria()
    await guardar('tareas', { titulo: 'Examen de Macro', tipo: 'examen', fecha: '2026-10-05', hecha: 0, creado: 1 }, movil)
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto)
    expect(await titulos(ordenador)).toEqual(['Examen de Macro'])
  })

  it('cambios distintos en cada dispositivo se juntan sin perder nada', async () => {
    const nube = remotoEnMemoria()
    const t = await guardar('tareas', { titulo: 'Entrega', tipo: 'entrega', hecha: 0, creado: 1 }, movil)
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto)

    await marcarTarea(t.id, true, movil) // en el móvil: la marca como hecha
    await guardar('eventos', { titulo: 'Médico', fecha: '2026-10-07' }, ordenador) // en el ordenador: un evento
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto)
    await sincronizarCon(movil, nube.remoto)

    for (const b of [movil, ordenador]) {
      expect((await b.tareas.get(t.id))?.hecha).toBe(1)
      expect((await b.eventos.toArray()).map((e) => e.titulo)).toEqual(['Médico'])
    }
  })

  it('lo borrado en un dispositivo se borra en el otro', async () => {
    const nube = remotoEnMemoria()
    const t = await guardar('tareas', { titulo: 'Bloomberg', tipo: 'examen', hecha: 0, creado: 1 }, movil)
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto)
    await borrar('tareas', t.id, ordenador)
    await sincronizarCon(ordenador, nube.remoto)
    await sincronizarCon(movil, nube.remoto)
    expect(await movil.tareas.count()).toBe(0)
  })

  it('dos dispositivos con los datos iniciales no duplican asignaturas, hábitos ni exámenes', async () => {
    const nube = remotoEnMemoria()
    await cargarDatosIniciales(movil)
    await cargarDatosIniciales(ordenador)
    await alternarDia('ini-habito-gimnasio', '2026-10-05', movil)
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto)
    expect(await ordenador.asignaturas.count()).toBe(8)
    expect(await ordenador.habitos.count()).toBe(2)
    expect(await ordenador.tareas.count()).toBe(10)
    expect(await ordenador.registros.count()).toBe(1)
  })

  it('"usar los datos de la nube" sustituye los de un dispositivo nuevo', async () => {
    const nube = remotoEnMemoria()
    await guardar('eventos', { titulo: 'Del móvil', fecha: '2026-10-01' }, movil)
    await sincronizarCon(movil, nube.remoto)
    await guardar('eventos', { titulo: 'Prueba en el ordenador', fecha: '2026-10-02' }, ordenador)
    await sincronizarCon(ordenador, nube.remoto, true)
    expect((await ordenador.eventos.toArray()).map((e) => e.titulo)).toEqual(['Del móvil'])
  })

  it('si otro dispositivo guarda a la vez, vuelve a intentarlo', async () => {
    const nube = remotoEnMemoria()
    await sincronizarCon(movil, nube.remoto)
    nube.forzarConflictos(2)
    await guardar('eventos', { titulo: 'Tras conflicto', fecha: '2026-10-01' }, movil)
    await sincronizarCon(movil, nube.remoto)
    expect(nube.texto()).toContain('Tras conflicto')
  })

  it('la clave de GitHub y los ajustes del dispositivo nunca se suben', async () => {
    const nube = remotoEnMemoria()
    await guardarAjuste('sync.config', { token: 'github_pat_SECRETO' }, movil)
    await guardarAjuste('copia.ultima', '2026-09-29', movil)
    await guardarAjuste('clases.periodo', { desde: '2026-09-07', hasta: '2026-12-08' }, movil)
    await sincronizarCon(movil, nube.remoto)
    expect(nube.texto()).not.toContain('SECRETO')
    expect(nube.texto()).not.toContain('copia.ultima')
    expect(nube.texto()).toContain('clases.periodo')

    await guardarAjuste('sync.config', { token: 'del-ordenador' }, ordenador)
    await sincronizarCon(ordenador, nube.remoto, true)
    expect((await ordenador.ajustes.get('sync.config'))?.valor).toEqual({ token: 'del-ordenador' })
    expect(await ordenador.ajustes.get('clases.periodo')).toBeTruthy()
  })

  it('si no hay cambios, no vuelve a escribir en GitHub', async () => {
    const nube = remotoEnMemoria()
    await guardar('eventos', { titulo: 'Uno', fecha: '2026-10-01' }, movil)
    await sincronizarCon(movil, nube.remoto)
    const antes = nube.texto()
    await sincronizarCon(movil, nube.remoto)
    expect(nube.texto()).toBe(antes)
  })

  it('tras sincronizar, los dos dispositivos quedan con datos idénticos', async () => {
    const nube = remotoEnMemoria()
    await cargarDatosIniciales(movil)
    await guardar('tareas', { titulo: 'Solo móvil', tipo: 'repaso', hecha: 0, creado: 1 }, movil)
    await sincronizarCon(movil, nube.remoto)
    await sincronizarCon(ordenador, nube.remoto, true)
    expect(await titulos(ordenador)).toEqual(await titulos(movil))
  })
})

import { describe, expect, it } from 'vitest'
import { fusionar, sonIguales, vacios, type DatosSincronizados } from './fusion'

function datos(parcial: Partial<DatosSincronizados>): DatosSincronizados {
  return { ...vacios(), ...parcial }
}
const tarea = (id: string, titulo: string, actualizado: number, extra: object = {}) => ({ id, titulo, tipo: 'otra', hecha: 0, creado: 0, actualizado, ...extra })
const borrado = (tabla: string, id: string, cuando: number) => ({ id: `${tabla}|${id}`, tabla, registroId: id, cuando })

describe('fusionar datos de dos dispositivos', () => {
  it('junta lo que solo está en cada lado', () => {
    const r = fusionar(datos({ tareas: [tarea('a', 'Del móvil', 1)] }), datos({ tareas: [tarea('b', 'Del ordenador', 1)] }))
    expect(r.tareas.map((t) => t.titulo)).toEqual(['Del móvil', 'Del ordenador'])
  })

  it('si el mismo registro cambió en los dos, gana el cambio más reciente', () => {
    const movil = datos({ tareas: [tarea('a', 'Título viejo', 10, { hecha: 1 })] })
    const ordenador = datos({ tareas: [tarea('a', 'Título nuevo', 20)] })
    expect(fusionar(movil, ordenador).tareas).toEqual([tarea('a', 'Título nuevo', 20)])
    expect(fusionar(ordenador, movil).tareas).toEqual([tarea('a', 'Título nuevo', 20)])
  })

  it('un borrado posterior al último cambio elimina el registro en el otro lado', () => {
    const movil = datos({ tareas: [tarea('a', 'Examen', 10)] })
    const ordenador = datos({ borrados: [borrado('tareas', 'a', 15)] })
    const r = fusionar(movil, ordenador)
    expect(r.tareas).toEqual([])
    expect(r.borrados).toHaveLength(1)
  })

  it('si se vuelve a crear (o se cambia) después de borrarlo, se conserva', () => {
    // Ej.: desmarcar y volver a marcar el gimnasio el mismo día.
    const r = fusionar(
      datos({ registros: [{ id: 'gim|2026-10-05', habitoId: 'gim', fecha: '2026-10-05', actualizado: 30 }] }),
      datos({ borrados: [borrado('registros', 'gim|2026-10-05', 20)] }),
    )
    expect(r.registros).toHaveLength(1)
  })

  it('el borrado solo afecta a su tabla', () => {
    const r = fusionar(datos({ tareas: [tarea('x', 'Tarea', 1)], eventos: [{ id: 'x', titulo: 'Evento', fecha: '2026-10-01', actualizado: 1 }] }), datos({ borrados: [borrado('eventos', 'x', 5)] }))
    expect(r.tareas).toHaveLength(1)
    expect(r.eventos).toHaveLength(0)
  })

  it('los ajustes se juntan por su clave y gana el más reciente', () => {
    const r = fusionar(
      datos({ ajustes: [{ clave: 'clases.periodo', valor: { hasta: '2026-12-18' }, actualizado: 1 }] }),
      datos({ ajustes: [{ clave: 'clases.periodo', valor: { hasta: '2026-12-08' }, actualizado: 2 }, { clave: 'otro', valor: 1 }] }),
    )
    expect(r.ajustes).toEqual([
      { clave: 'clases.periodo', valor: { hasta: '2026-12-08' }, actualizado: 2 },
      { clave: 'otro', valor: 1 },
    ])
  })

  it('da el mismo resultado lo junte quien lo junte, y juntar dos veces no cambia nada', () => {
    const a = datos({
      tareas: [tarea('1', 'A', 5), tarea('2', 'B', 9)],
      borrados: [borrado('tareas', '3', 4)],
    })
    const b = datos({
      tareas: [tarea('2', 'B editada', 12), tarea('3', 'C', 2)],
      habitos: [{ id: 'h', nombre: 'Leer', actualizado: 1 }],
    })
    const ab = fusionar(a, b)
    expect(sonIguales(ab, fusionar(b, a))).toBe(true)
    expect(sonIguales(fusionar(ab, b), ab)).toBe(true)
    expect(ab.tareas.map((t) => t.titulo)).toEqual(['A', 'B editada'])
  })

  it('con empate de hora elige siempre la misma versión en ambos lados', () => {
    const x = datos({ tareas: [tarea('a', 'X', 7)] })
    const y = datos({ tareas: [tarea('a', 'Y', 7)] })
    expect(fusionar(x, y).tareas).toEqual(fusionar(y, x).tareas)
  })
})

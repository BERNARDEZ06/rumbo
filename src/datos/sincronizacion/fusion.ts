import { TABLAS, type NombreTabla } from '../modelos'

/**
 * Cómo se juntan los datos de dos dispositivos (sin servidor, sin perder nada):
 * - Cada registro tiene un id y la hora de su último cambio ("actualizado"). Si está en los dos lados, gana el más reciente.
 * - Los borrados se apuntan en "borrados" con su hora. Un registro se elimina si se borró después de su último cambio.
 * - Los ajustes se juntan igual, por su clave.
 * El resultado es el mismo lo junte quien lo junte (A con B o B con A).
 */

export type TablaSincronizada = NombreTabla | 'ajustes' | 'borrados'
export const TABLAS_SINCRONIZADAS: TablaSincronizada[] = [...TABLAS, 'ajustes', 'borrados']

type Fila = Record<string, unknown>
export type DatosSincronizados = Record<TablaSincronizada, Fila[]>

const clave = (tabla: TablaSincronizada, fila: Fila) => String(tabla === 'ajustes' ? fila.clave : fila.id)
const momento = (tabla: TablaSincronizada, fila: Fila) => Number((tabla === 'borrados' ? fila.cuando : fila.actualizado) ?? 0)

/** De dos versiones de un registro, la más reciente; si empatan, una fija (para que ambos lados elijan igual). */
function ganadora(tabla: TablaSincronizada, a: Fila, b: Fila): Fila {
  const ma = momento(tabla, a)
  const mb = momento(tabla, b)
  if (ma !== mb) return ma > mb ? a : b
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b
}

function juntarTabla(tabla: TablaSincronizada, a: Fila[] = [], b: Fila[] = []): Map<string, Fila> {
  const resultado = new Map<string, Fila>()
  for (const fila of [...a, ...b]) {
    const k = clave(tabla, fila)
    const previa = resultado.get(k)
    resultado.set(k, previa ? ganadora(tabla, previa, fila) : fila)
  }
  return resultado
}

export function vacios(): DatosSincronizados {
  return Object.fromEntries(TABLAS_SINCRONIZADAS.map((t) => [t, []])) as unknown as DatosSincronizados
}

export function fusionar(a: DatosSincronizados, b: DatosSincronizados): DatosSincronizados {
  const borrados = juntarTabla('borrados', a.borrados, b.borrados)
  const resultado = vacios()
  resultado.borrados = [...borrados.values()]
  resultado.ajustes = [...juntarTabla('ajustes', a.ajustes, b.ajustes).values()]
  for (const tabla of TABLAS) {
    resultado[tabla] = [...juntarTabla(tabla, a[tabla], b[tabla]).values()].filter((fila) => {
      const borrado = borrados.get(`${tabla}|${fila.id}`)
      return !borrado || Number(borrado.cuando) < momento(tabla, fila)
    })
  }
  return normalizar(resultado)
}

/** Ordena todo por clave, para poder comparar y para que el archivo cambie lo mínimo. */
export function normalizar(datos: DatosSincronizados): DatosSincronizados {
  const resultado = vacios()
  for (const tabla of TABLAS_SINCRONIZADAS) {
    resultado[tabla] = [...(datos[tabla] ?? [])].sort((x, y) => (clave(tabla, x) < clave(tabla, y) ? -1 : 1))
  }
  return resultado
}

export function sonIguales(a: DatosSincronizados, b: DatosSincronizados): boolean {
  return JSON.stringify(normalizar(a)) === JSON.stringify(normalizar(b))
}

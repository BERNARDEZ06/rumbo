export type Tema = 'auto' | 'claro' | 'oscuro'
export type TemaAplicado = 'claro' | 'oscuro'

export const CLAVE_TEMA = 'rumbo.tema'

/** Decide qué tema se ve realmente: en "auto" manda el ajuste del sistema. */
export function resolverTema(tema: Tema, sistemaOscuro: boolean): TemaAplicado {
  if (tema === 'auto') return sistemaOscuro ? 'oscuro' : 'claro'
  return tema
}

/** Lee el tema guardado; si no hay o no es válido, usa "auto". */
export function leerTema(valor: string | null): Tema {
  return valor === 'claro' || valor === 'oscuro' || valor === 'auto' ? valor : 'auto'
}

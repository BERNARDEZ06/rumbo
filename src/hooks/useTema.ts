import { useSyncExternalStore } from 'react'
import { CLAVE_TEMA, leerTema, resolverTema, type Tema } from '../logica/tema'

const consultaOscuro = window.matchMedia('(prefers-color-scheme: dark)')
const oyentes = new Set<() => void>()

function leerGuardado(): Tema {
  try {
    return leerTema(localStorage.getItem(CLAVE_TEMA))
  } catch {
    return 'auto'
  }
}

let temaActual: Tema = leerGuardado()

/** Pone o quita la clase .dark en <html> y ajusta el color de la barra del sistema. */
export function aplicarTema(tema: Tema = temaActual) {
  const oscuro = resolverTema(tema, consultaOscuro.matches) === 'oscuro'
  document.documentElement.classList.toggle('dark', oscuro)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', oscuro ? '#0b0f17' : '#f6f7f9')
}

consultaOscuro.addEventListener('change', () => aplicarTema())

function cambiarTema(tema: Tema) {
  temaActual = tema
  try {
    localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Sin almacenamiento disponible: el tema se aplica solo durante esta visita.
  }
  aplicarTema(tema)
  oyentes.forEach((avisar) => avisar())
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

export function useTema() {
  const tema = useSyncExternalStore(suscribir, () => temaActual)
  return [tema, cambiarTema] as const
}

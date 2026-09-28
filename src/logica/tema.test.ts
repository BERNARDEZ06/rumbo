import { describe, expect, it } from 'vitest'
import { leerTema, resolverTema } from './tema'

describe('resolverTema', () => {
  it('en automático sigue al sistema', () => {
    expect(resolverTema('auto', true)).toBe('oscuro')
    expect(resolverTema('auto', false)).toBe('claro')
  })

  it('claro y oscuro ignoran el sistema', () => {
    expect(resolverTema('claro', true)).toBe('claro')
    expect(resolverTema('oscuro', false)).toBe('oscuro')
  })
})

describe('leerTema', () => {
  it('acepta valores válidos', () => {
    expect(leerTema('oscuro')).toBe('oscuro')
    expect(leerTema('claro')).toBe('claro')
  })

  it('usa automático si no hay valor o es raro', () => {
    expect(leerTema(null)).toBe('auto')
    expect(leerTema('morado')).toBe('auto')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { aBase64, ClaveNoValida, comprobarAcceso, ConflictoRemoto, deBase64, ErrorSincronizacion, remotoGitHub, SinConexion } from './github'

const config = { usuario: 'BERNARDEZ06', repositorio: 'rumbo-datos', token: 'clave', ruta: 'rumbo-datos.json' }
const json = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('base64 con tildes y emojis', () => {
  it('ida y vuelta', () => {
    const texto = '{"titulo":"Examen de Estadística 📚 — ñ"}'
    expect(deBase64(aBase64(texto))).toBe(texto)
    // GitHub parte el base64 en líneas
    expect(deBase64(aBase64(texto).replace(/(.{10})/g, '$1\n'))).toBe(texto)
  })
})

describe('leer y escribir en GitHub', () => {
  it('si el archivo no existe devuelve null', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({ message: 'Not Found' }, 404)))
    expect(await remotoGitHub(config).leer()).toBeNull()
  })

  it('lee el contenido y su versión', async () => {
    const f = vi.fn(async () => json({ content: aBase64('{"a":"á"}'), encoding: 'base64', sha: 'v1' }))
    vi.stubGlobal('fetch', f)
    expect(await remotoGitHub(config).leer()).toEqual({ texto: '{"a":"á"}', sha: 'v1' })
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.github.com/repos/BERNARDEZ06/rumbo-datos/contents/rumbo-datos.json')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer clave')
  })

  it('escribe con la versión anterior y devuelve la nueva', async () => {
    const f = vi.fn(async () => json({ content: { sha: 'v2' } }))
    vi.stubGlobal('fetch', f)
    expect(await remotoGitHub(config).escribir('{"x":1}', 'v1')).toBe('v2')
    const cuerpo = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(cuerpo).toMatchObject({ sha: 'v1', content: aBase64('{"x":1}') })
  })

  it('traduce los errores a mensajes claros', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({}, 409)))
    await expect(remotoGitHub(config).escribir('x', 'viejo')).rejects.toBeInstanceOf(ConflictoRemoto)
    vi.stubGlobal('fetch', vi.fn(async () => json({}, 401)))
    await expect(remotoGitHub(config).leer()).rejects.toBeInstanceOf(ClaveNoValida)
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    await expect(remotoGitHub(config).leer()).rejects.toBeInstanceOf(SinConexion)
  })
})

describe('comprobar la clave y el repositorio', () => {
  function simular(repo: object | null) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => (url.endsWith('/user') ? json({ login: 'BERNARDEZ06' }) : repo ? json(repo) : json({}, 404))),
    )
  }

  it('acepta un repositorio privado con permiso de escritura', async () => {
    simular({ private: true, permissions: { push: true } })
    expect(await comprobarAcceso('clave', 'rumbo-datos')).toBe('BERNARDEZ06')
  })

  it('rechaza un repositorio público', async () => {
    simular({ private: false, permissions: { push: true } })
    await expect(comprobarAcceso('clave', 'rumbo')).rejects.toThrow('tiene que ser privado')
  })

  it('avisa si no encuentra el repositorio', async () => {
    simular(null)
    await expect(comprobarAcceso('clave', 'rumbo-datos')).rejects.toBeInstanceOf(ErrorSincronizacion)
  })
})

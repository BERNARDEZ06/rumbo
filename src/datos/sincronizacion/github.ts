/**
 * Conexión con GitHub para guardar los datos en un archivo de un repositorio privado del usuario.
 * Solo usa la API pública de GitHub desde el propio navegador: no hay servidor intermedio.
 */

const API = 'https://api.github.com'

export interface ConfigSincronizacion {
  usuario: string
  repositorio: string
  token: string
  /** Archivo dentro del repositorio. */
  ruta: string
}

export interface ArchivoRemoto {
  texto: string
  /** Versión del archivo en GitHub; hace falta para sobrescribirlo sin pisar cambios de otro dispositivo. */
  sha: string
}

/** Lo que la sincronización necesita del almacén remoto (así se puede probar sin GitHub). */
export interface Remoto {
  leer(): Promise<ArchivoRemoto | null>
  /** Guarda el texto. Si `sha` no coincide con la versión actual, lanza ConflictoRemoto. */
  escribir(texto: string, sha: string | null): Promise<string>
}

export class ErrorSincronizacion extends Error {}
export class SinConexion extends ErrorSincronizacion {
  constructor() {
    super('Sin conexión a internet. Se sincronizará cuando vuelva.')
  }
}
export class ClaveNoValida extends ErrorSincronizacion {
  constructor() {
    super('La clave de GitHub no es válida o ha caducado. Crea una nueva y vuelve a conectar.')
  }
}
export class ConflictoRemoto extends ErrorSincronizacion {
  constructor() {
    super('Otro dispositivo ha guardado a la vez.')
  }
}

/* ---------- Texto ⇄ base64 (con tildes y emojis) ---------- */

export function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto)
  let binario = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binario)
}

export function deBase64(b64: string): string {
  const binario = atob(b64.replace(/\s/g, ''))
  return new TextDecoder().decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)))
}

/* ---------- Peticiones ---------- */

async function peticion(token: string, ruta: string, init: RequestInit = {}, aceptar = 'application/vnd.github+json'): Promise<Response> {
  let respuesta: Response
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: aceptar,
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  } catch {
    throw new SinConexion()
  }
  if (respuesta.status === 401) throw new ClaveNoValida()
  return respuesta
}

const rutaArchivo = (c: ConfigSincronizacion) =>
  `/repos/${encodeURIComponent(c.usuario)}/${encodeURIComponent(c.repositorio)}/contents/${c.ruta.split('/').map(encodeURIComponent).join('/')}`

/** Comprueba la clave y el repositorio. Devuelve el usuario de GitHub al que pertenece la clave. */
export async function comprobarAcceso(token: string, repositorio: string): Promise<string> {
  const yo = await peticion(token, '/user')
  if (!yo.ok) throw new ErrorSincronizacion('No se pudo comprobar la clave de GitHub.')
  const usuario = String((await yo.json()).login)

  const repo = await peticion(token, `/repos/${encodeURIComponent(usuario)}/${encodeURIComponent(repositorio)}`)
  if (repo.status === 404) {
    throw new ErrorSincronizacion(`No se encuentra el repositorio «${repositorio}» o la clave no tiene acceso a él.`)
  }
  if (!repo.ok) throw new ErrorSincronizacion('No se pudo comprobar el repositorio.')
  const info = await repo.json()
  if (!info.private) throw new ErrorSincronizacion(`El repositorio «${repositorio}» tiene que ser privado, para que nadie más vea tus datos.`)
  if (info.permissions && !info.permissions.push) {
    throw new ErrorSincronizacion('La clave no tiene permiso para escribir. Dale el permiso «Contents: Read and write».')
  }
  return usuario
}

/** Almacén remoto en un archivo de GitHub. */
export function remotoGitHub(config: ConfigSincronizacion): Remoto {
  return {
    async leer() {
      const r = await peticion(config.token, rutaArchivo(config))
      if (r.status === 404) return null
      if (!r.ok) throw new ErrorSincronizacion(`GitHub respondió con un error (${r.status}).`)
      const json = await r.json()
      if (json.content && json.encoding === 'base64') return { texto: deBase64(json.content), sha: json.sha }
      // Archivos de más de 1 MB: GitHub no manda el contenido en la misma respuesta.
      const crudo = await peticion(config.token, rutaArchivo(config), {}, 'application/vnd.github.raw+json')
      if (!crudo.ok) throw new ErrorSincronizacion(`GitHub respondió con un error (${crudo.status}).`)
      return { texto: await crudo.text(), sha: json.sha }
    },

    async escribir(texto, sha) {
      const r = await peticion(config.token, rutaArchivo(config), {
        method: 'PUT',
        body: JSON.stringify({ message: 'Rumbo: sincronizar datos', content: aBase64(texto), ...(sha ? { sha } : {}) }),
      })
      if (r.status === 409 || r.status === 422) throw new ConflictoRemoto()
      if (r.status === 403 || r.status === 404) {
        throw new ErrorSincronizacion('La clave no tiene permiso para guardar en el repositorio. Revisa el permiso «Contents: Read and write».')
      }
      if (!r.ok) throw new ErrorSincronizacion(`GitHub respondió con un error (${r.status}).`)
      return String((await r.json()).content.sha)
    },
  }
}

import { expect, test, type BrowserContext, type Page } from '@playwright/test'

/**
 * GitHub simulado en memoria (compartido por los dos "dispositivos" de la prueba):
 * usuario, repositorio privado y un archivo con su versión (sha).
 */
function crearGitHubFalso() {
  const estado = { archivo: null as null | { contenido: string; sha: string }, version: 0, escrituras: 0 }
  const cabeceras = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET, PUT, OPTIONS',
    'content-type': 'application/json',
  }
  async function conectar(contexto: BrowserContext) {
    await contexto.route('https://api.github.com/**', async (route) => {
      const req = route.request()
      const url = new URL(req.url())
      const responder = (status: number, cuerpo: unknown = {}) => route.fulfill({ status, headers: cabeceras, body: JSON.stringify(cuerpo) })
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cabeceras })
      if (req.headers()['authorization'] !== 'Bearer github_pat_PRUEBA_1234567890') return responder(401)
      if (url.pathname === '/user') return responder(200, { login: 'BERNARDEZ06' })
      if (url.pathname === '/repos/BERNARDEZ06/rumbo-datos') return responder(200, { private: true, permissions: { push: true } })
      if (url.pathname === '/repos/BERNARDEZ06/rumbo-datos/contents/rumbo-datos.json') {
        if (req.method() === 'GET') {
          return estado.archivo ? responder(200, { content: estado.archivo.contenido, encoding: 'base64', sha: estado.archivo.sha }) : responder(404)
        }
        const cuerpo = req.postDataJSON() as { content: string; sha?: string }
        if ((estado.archivo?.sha ?? undefined) !== cuerpo.sha) return responder(409)
        estado.archivo = { contenido: cuerpo.content, sha: `v${++estado.version}` }
        estado.escrituras++
        return responder(200, { content: { sha: estado.archivo.sha } })
      }
      return responder(404)
    })
  }
  const texto = () => (estado.archivo ? Buffer.from(estado.archivo.contenido, 'base64').toString('utf8') : '')
  return { conectar, texto, estado }
}

async function configurar(page: Page) {
  await page.goto('/#/ajustes')
  const seccion = page.getByRole('region', { name: 'Sincronización' })
  await seccion.getByRole('button', { name: 'Configurar' }).click()
  const hoja = page.getByRole('dialog', { name: 'Conectar con GitHub' })
  await hoja.getByLabel('Clave de GitHub').fill('github_pat_PRUEBA_1234567890')
  await hoja.getByRole('button', { name: 'Conectar' }).click()
  return seccion
}

test('lo que apuntas en un dispositivo aparece en el otro', async ({ browser }) => {
  const github = crearGitHubFalso()
  const opciones = { baseURL: 'http://localhost:5173', locale: 'es-ES', timezoneId: 'Europe/Madrid' }

  // Dispositivo 1 (móvil): se conecta el primero, sube sus datos y apunta un examen.
  const movil = await browser.newContext(opciones)
  await github.conectar(movil)
  const pMovil = await movil.newPage()
  const sMovil = await configurar(pMovil)
  await expect(sMovil.getByText(/Sincronizado/)).toBeVisible()
  await expect(sMovil.getByText('BERNARDEZ06/rumbo-datos')).toBeVisible()
  expect(github.texto()).toContain('Examen de Macro')
  expect(github.texto()).not.toContain('github_pat_') // la clave nunca se sube

  await pMovil.goto('/#/tareas')
  await pMovil.getByRole('button', { name: 'Nueva' }).click()
  const hoja = pMovil.getByRole('dialog', { name: 'Nuevo: examen' })
  await hoja.getByLabel('Título').fill('Examen oral de English')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect.poll(() => github.texto(), { timeout: 10_000 }).toContain('Examen oral de English')

  // Dispositivo 2 (ordenador): se conecta y usa los datos de GitHub.
  const ordenador = await browser.newContext(opciones)
  await github.conectar(ordenador)
  const pOrdenador = await ordenador.newPage()
  await configurar(pOrdenador)
  await pOrdenador.getByRole('dialog', { name: 'Ya hay datos en GitHub' }).getByRole('button', { name: /Usar los de GitHub/ }).click()
  await expect(pOrdenador.getByRole('region', { name: 'Sincronización' }).getByText(/Sincronizado/)).toBeVisible()
  await pOrdenador.goto('/#/tareas')
  await expect(pOrdenador.getByText('Examen oral de English')).toBeVisible()
  await expect(pOrdenador.getByRole('radio', { name: 'Pendientes (11)' })).toBeVisible() // sin duplicados

  // En el ordenador se marca como hecho; el móvil lo recibe al sincronizar.
  await pOrdenador.getByRole('button', { name: 'Marcar Examen oral de English como hecha' }).click()
  await expect.poll(() => github.texto(), { timeout: 10_000 }).toMatch(/"titulo":"Examen oral de English"[^}]*"hecha":1|"hecha":1[^}]*"titulo":"Examen oral de English"/)
  await pMovil.goto('/#/ajustes')
  await pMovil.getByRole('button', { name: 'Sincronizar ahora' }).click()
  await pMovil.goto('/#/tareas')
  await expect(pMovil.getByRole('radio', { name: 'Pendientes (10)' })).toBeVisible()

  await movil.close()
  await ordenador.close()
})

test('una clave no válida muestra un mensaje claro', async ({ page, context }) => {
  const github = crearGitHubFalso()
  await github.conectar(context)
  await page.goto('/#/ajustes')
  await page.getByRole('region', { name: 'Sincronización' }).getByRole('button', { name: 'Configurar' }).click()
  const hoja = page.getByRole('dialog', { name: 'Conectar con GitHub' })
  await hoja.getByLabel('Clave de GitHub').fill('github_pat_CLAVE_EQUIVOCADA_123')
  await hoja.getByRole('button', { name: 'Conectar' }).click()
  await expect(hoja.getByText('La clave de GitHub no es válida o ha caducado.', { exact: false })).toBeVisible()
})

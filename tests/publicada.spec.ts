import { expect, test } from '@playwright/test'

test('la versión publicada se puede instalar y funciona sin conexión', async ({ page, context }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1, name: 'Hoy' })).toBeVisible()

  // Ficha de la app (manifest) con nombre e iconos.
  const manifest = await page.evaluate(async () => {
    const enlace = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    return enlace ? (await fetch(enlace.href)).json() : null
  })
  expect(manifest).toMatchObject({ short_name: 'Rumbo', display: 'standalone', lang: 'es' })
  for (const icono of manifest.icons) expect((await page.request.get(`./${icono.src}`)).ok()).toBe(true)
  expect((await page.request.get('./apple-touch-icon.png')).ok()).toBe(true)

  // El "service worker" queda activo y guarda la app en el dispositivo.
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Hoy' })).toBeVisible()

  // Sin conexión: la app sigue abriendo y los datos siguen ahí.
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Hoy' })).toBeVisible()
  await page.getByRole('link', { name: 'Tareas' }).click()
  await expect(page.getByText('Examen de Macro')).toBeVisible()
  await context.setOffline(false)
})

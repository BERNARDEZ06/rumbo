import { expect, test } from '@playwright/test'

const SECCIONES = ['Hoy', 'Calendario', 'Tareas', 'Hábitos', 'Ajustes']

test('se puede ir a cada sección desde el menú', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Hoy' })).toBeVisible()
  const menu = page.getByRole('navigation', { name: 'Secciones' }).filter({ visible: true })
  for (const nombre of SECCIONES) {
    await menu.getByRole('link', { name: nombre }).click()
    await expect(page.getByRole('heading', { level: 1, name: nombre })).toBeVisible()
  }
})

test('el botón + abre y cierra el menú de añadir', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Añadir', exact: true }).filter({ visible: true }).click()
  const dialogo = page.getByRole('dialog', { name: 'Añadir', exact: true })
  await expect(dialogo).toBeVisible()
  await expect(dialogo.getByText('Examen')).toBeVisible()
  await dialogo.getByRole('button', { name: 'Cerrar' }).click()
  await expect(dialogo).toBeHidden()
})

test('el tema oscuro se aplica y se recuerda al recargar', async ({ page }) => {
  await page.goto('/#/ajustes')
  await page.getByRole('radio', { name: 'Oscuro' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('radio', { name: 'Claro' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('no hay desplazamiento horizontal', async ({ page }) => {
  // Con el reloj en un día con clases largas ("Estadística · Práctica"), para cubrir el peor caso.
  await page.clock.setFixedTime(new Date('2026-10-07T12:00:00+02:00'))
  for (const ruta of ['/', '/#/ajustes', '/#/habitos', '/#/tareas', '/#/calendario', '/#/ajustes/clases']) {
    await page.goto(ruta)
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(ancho).toBeLessThanOrEqual(0)
  }
})

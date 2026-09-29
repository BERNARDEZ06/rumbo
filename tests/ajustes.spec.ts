import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-29T12:00:00+02:00'))
  await page.goto('/#/ajustes')
  await expect(page.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeVisible()
})

const datos = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Tus datos' })

test('avisa si nunca se ha hecho copia y descarga una', async ({ page }) => {
  await expect(datos(page).getByText('Aún no has hecho ninguna copia.')).toBeVisible()
  const descarga = page.waitForEvent('download')
  await datos(page).getByRole('button', { name: 'Descargar copia' }).click()
  const archivo = await descarga
  expect(archivo.suggestedFilename()).toBe('rumbo-copia-2026-09-29.json')
  const copia = JSON.parse(readFileSync(await archivo.path(), 'utf8'))
  expect(copia.app).toBe('rumbo')
  expect(copia.tablas.tareas).toHaveLength(10)
  await expect(datos(page).getByText('Última copia: hoy.')).toBeVisible()
})

test('recuperar una copia sustituye los datos', async ({ page }) => {
  // 1. Descargar la copia con los datos iniciales.
  const descarga = page.waitForEvent('download')
  await datos(page).getByRole('button', { name: 'Descargar copia' }).click()
  const ruta = await (await descarga).path()

  // 2. Cambiar algo: borrar un examen.
  await page.goto('/#/tareas')
  await page.getByRole('button', { name: 'Abrir Bloomberg' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Borrar' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '¿Seguro? Borrar' }).click()
  await expect(page.getByText('Bloomberg')).toBeHidden()

  // 3. Recuperar la copia: Bloomberg vuelve.
  await page.goto('/#/ajustes')
  await datos(page).getByLabel('Archivo de copia').setInputFiles(ruta)
  const hoja = page.getByRole('dialog', { name: '¿Recuperar esta copia?' })
  await expect(hoja.getByText(/2 hábitos, 10 tareas, 8 asignaturas/)).toBeVisible()
  await hoja.getByRole('button', { name: 'Sustituir' }).click()
  await expect(datos(page).getByText('Datos recuperados.')).toBeVisible()
  await page.goto('/#/tareas')
  await expect(page.getByText('Bloomberg')).toBeVisible()
})

test('rechaza un archivo que no es una copia', async ({ page }) => {
  await datos(page).getByLabel('Archivo de copia').setInputFiles({
    name: 'otra-cosa.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hola": 1}'),
  })
  await expect(datos(page).getByText('Este archivo no es una copia de seguridad de Rumbo.')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('muestra la versión', async ({ page }) => {
  await expect(page.getByText(/Rumbo · versión \d+\.\d+\.\d+/)).toBeVisible()
})

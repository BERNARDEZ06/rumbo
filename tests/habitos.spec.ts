import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/habitos')
  await expect(page.getByRole('heading', { level: 1, name: 'Hábitos' })).toBeVisible()
})

test('la primera vez aparecen Gimnasio y Estudiar', async ({ page }) => {
  await expect(page.getByText('Gimnasio', { exact: true })).toBeVisible()
  await expect(page.getByText('4 días por semana')).toBeVisible()
  await expect(page.getByText('Estudiar', { exact: true })).toBeVisible()
  await expect(page.getByText('2 h al día')).toBeVisible()
})

test('marcar el gimnasio hoy y desmarcarlo', async ({ page }) => {
  const tarjeta = page.getByRole('article').filter({ hasText: 'Gimnasio' })
  await tarjeta.getByRole('button', { name: 'Marcar Gimnasio hoy' }).click()
  await expect(tarjeta.getByText('1/4 esta semana')).toBeVisible()
  await page.reload()
  await expect(tarjeta.getByText('1/4 esta semana')).toBeVisible()
  await tarjeta.getByRole('button', { name: 'Desmarcar Gimnasio hoy' }).click()
  await expect(tarjeta.getByText('0/4 esta semana')).toBeVisible()
})

test('apuntar horas de estudio hasta cumplir las 2 h', async ({ page }) => {
  const tarjeta = page.getByRole('article').filter({ hasText: 'Estudiar' })
  await tarjeta.getByRole('button', { name: 'Apuntar tiempo de Estudiar' }).click()
  const hoja = page.getByRole('dialog')
  await hoja.getByRole('button', { name: '+1h', exact: true }).click()
  await hoja.getByRole('button', { name: '+30m' }).click()
  await expect(hoja).toContainText('1 h 30 min / 2 h')
  await hoja.getByRole('button', { name: '+30m' }).click()
  await expect(hoja).toContainText('2 h / 2 h')
  await hoja.getByRole('button', { name: 'Hecho' }).click()
  await expect(tarjeta.getByText('1 día')).toBeVisible() // racha
  await expect(tarjeta.getByText('2 h esta semana')).toBeVisible()
})

test('crear, marcar y archivar un hábito nuevo', async ({ page }) => {
  await page.getByRole('button', { name: 'Nuevo' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo hábito' })
  await hoja.getByLabel('Nombre').fill('Leer')
  await hoja.getByRole('button', { name: 'Icono 📖' }).click()
  await hoja.getByRole('button', { name: 'Crear hábito' }).click()
  const tarjeta = page.getByRole('article').filter({ hasText: 'Leer' })
  await expect(tarjeta.getByText('Cada día')).toBeVisible()
  await tarjeta.getByRole('button', { name: 'Marcar Leer hoy' }).click()
  await expect(tarjeta.getByText('1 día')).toBeVisible()

  await tarjeta.getByRole('button', { name: 'Editar Leer' }).click()
  await page.getByRole('dialog', { name: 'Editar hábito' }).getByRole('button', { name: 'Archivar' }).click()
  await expect(tarjeta).toBeHidden()
  await page.getByRole('button', { name: 'Archivados (1)' }).click()
  await expect(page.getByRole('button', { name: /Leer/ })).toBeVisible()
})

test('el botón + permite apuntar horas de estudio', async ({ page }) => {
  await page.getByRole('button', { name: 'Añadir' }).filter({ visible: true }).click()
  await page.getByRole('button', { name: /Horas de estudio/ }).click()
  await expect(page.getByRole('dialog', { name: /Estudiar/ })).toBeVisible()
})

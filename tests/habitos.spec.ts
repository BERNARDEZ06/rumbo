import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/habitos')
  await expect(page.getByRole('heading', { level: 1, name: 'Hábitos' })).toBeVisible()
})

test('la primera vez aparecen Gimnasio y Estudiar', async ({ page }) => {
  await expect(page.getByText('Gimnasio', { exact: true })).toBeVisible()
  await expect(page.getByText('4 días por semana')).toBeVisible()
  await expect(page.getByText('Estudiar', { exact: true })).toBeVisible()
  await expect(page.getByText('14 h por semana', { exact: true })).toBeVisible()
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

test('apuntar horas de estudio y ver el total de la semana', async ({ page }) => {
  const tarjeta = page.getByRole('article').filter({ hasText: 'Estudiar' })
  await tarjeta.getByRole('button', { name: 'Apuntar tiempo de Estudiar' }).click()
  const hoja = page.getByRole('dialog')
  await hoja.getByRole('button', { name: '+1h', exact: true }).click()
  await hoja.getByRole('button', { name: '+30m' }).click()
  await expect(hoja).toContainText('Esta semana: 1 h 30 min de 14 h')
  await hoja.getByRole('button', { name: 'Hecho' }).click()
  await expect(tarjeta.getByText('1 h 30 min de 14 h esta semana')).toBeVisible()
  await expect(tarjeta.getByRole('button', { name: 'Apuntar tiempo de Estudiar' })).toContainText('1 h 30 min')
})

test('ajustar las horas de estudio solo para esta semana', async ({ page }) => {
  const tarjeta = page.getByRole('article').filter({ hasText: 'Estudiar' })
  await tarjeta.getByRole('button', { name: 'Ajustar esta semana' }).click()
  const hoja = page.getByRole('dialog', { name: 'Objetivo de esta semana' })
  await expect(hoja).toContainText('14 h')
  await hoja.getByRole('button', { name: 'Más' }).click()
  await hoja.getByRole('button', { name: 'Más' }).click()
  await expect(hoja).toContainText('16 h')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(tarjeta.getByText('0 min de 16 h esta semana')).toBeVisible()
  await expect(tarjeta.getByText('14 h por semana', { exact: true })).toBeVisible() // el habitual no cambia

  await tarjeta.getByRole('button', { name: /Objetivo ajustado/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Usar habitual' }).click()
  await expect(tarjeta.getByText('0 min de 14 h esta semana')).toBeVisible()
})

test('una semana con menos días de gimnasio mantiene la racha', async ({ page }) => {
  const tarjeta = page.getByRole('article').filter({ hasText: 'Gimnasio' })
  await tarjeta.getByRole('button', { name: 'Ajustar esta semana' }).click()
  const hoja = page.getByRole('dialog', { name: 'Objetivo de esta semana' })
  for (let i = 0; i < 3; i++) await hoja.getByRole('button', { name: 'Menos' }).click()
  await expect(hoja).toContainText('1 día')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await tarjeta.getByRole('button', { name: 'Marcar Gimnasio hoy' }).click()
  await expect(tarjeta.getByText('1/1 esta semana')).toBeVisible()
  await expect(tarjeta.getByText('1 semana')).toBeVisible()
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
  await page.getByRole('button', { name: 'Añadir', exact: true }).filter({ visible: true }).click()
  await page.getByRole('button', { name: /Horas de estudio/ }).click()
  await expect(page.getByRole('dialog', { name: /Estudiar/ })).toBeVisible()
})

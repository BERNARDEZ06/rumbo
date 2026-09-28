import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/tareas')
  await expect(page.getByRole('heading', { level: 1, name: 'Tareas' })).toBeVisible()
})

test('aparecen los exámenes y la entrega que ya tenías, agrupados por fecha', async ({ page }) => {
  // Hoy (en las pruebas) es la fecha real del sistema; comprobamos lo que no depende del día.
  await expect(page.getByRole('radio', { name: 'Pendientes (10)' })).toBeVisible()
  await expect(page.getByText('Examen de Macro')).toBeVisible()
  await expect(page.getByText('Entrega de Macroeconomía')).toBeVisible()
  await expect(page.getByText('Bloomberg')).toBeVisible()
})

test('marcar una tarea como hecha y deshacerlo', async ({ page }) => {
  await page.getByRole('button', { name: 'Marcar Examen de Macro como hecha' }).click()
  await expect(page.getByRole('radio', { name: 'Pendientes (9)' })).toBeVisible()
  await page.getByRole('radio', { name: 'Hechas' }).click()
  await expect(page.getByText('Examen de Macro')).toBeVisible()
  await page.getByRole('button', { name: 'Desmarcar Examen de Macro' }).click()
  await expect(page.getByText('Examen de Macro')).toBeHidden()
})

test('filtrar por asignatura', async ({ page }) => {
  await page.getByRole('group', { name: 'Filtrar por asignatura' }).getByRole('button', { name: 'Estadística' }).click()
  await expect(page.getByRole('radio', { name: 'Pendientes (3)' })).toBeVisible()
  await expect(page.getByText('Examen de Macro')).toBeHidden()
  await expect(page.getByText('AI Estadística')).toBeVisible()
})

test('apuntar un repaso desde el botón + con título automático', async ({ page }) => {
  await page.getByRole('button', { name: 'Añadir', exact: true }).filter({ visible: true }).click()
  await page.getByRole('button', { name: /Repaso/ }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo: repaso' })
  await hoja.getByLabel('Asignatura').selectOption({ label: 'Contabilidad Financiera' })
  await expect(hoja.getByLabel('Título')).toHaveAttribute('placeholder', 'Repaso de Contabilidad (automático)')
  await hoja.getByLabel('Fecha').fill('2026-10-06')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByText('Repaso de Contabilidad')).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Pendientes (11)' })).toBeVisible()
})

test('editar y borrar una tarea', async ({ page }) => {
  await page.getByRole('button', { name: 'Abrir Bloomberg' }).click()
  const hoja = page.getByRole('dialog', { name: 'Editar' })
  await hoja.getByLabel('Título').fill('Certificación Bloomberg')
  await hoja.getByLabel('Hora (opcional)').fill('10:00')
  await hoja.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Certificación Bloomberg')).toBeVisible()
  await expect(page.getByText(/3 dic.* · 10:00/)).toBeVisible()

  await page.getByRole('button', { name: 'Abrir Certificación Bloomberg' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Borrar' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '¿Seguro? Borrar' }).click()
  await expect(page.getByText('Certificación Bloomberg')).toBeHidden()
})

test('sin título ni asignatura no deja guardar', async ({ page }) => {
  await page.getByRole('button', { name: 'Nueva' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo: examen' })
  await expect(hoja.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  await hoja.getByLabel('Título').fill('Examen de inglés oral')
  await expect(hoja.getByRole('button', { name: 'Guardar' })).toBeEnabled()
})

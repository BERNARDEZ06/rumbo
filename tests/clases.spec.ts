import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/ajustes')
  await page.getByRole('link', { name: /Clases/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Clases' })).toBeVisible()
})

const seccion = (page: import('@playwright/test').Page, titulo: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: titulo, exact: true }) })

test('aparece el horario real cargado', async ({ page }) => {
  await expect(seccion(page, 'Asignaturas').getByRole('listitem')).toHaveCount(8)
  const horario = seccion(page, 'Horario semanal')
  await expect(horario.getByRole('listitem')).toHaveCount(14)
  await expect(horario.getByText('Lunes')).toBeVisible()
  await expect(horario.getByRole('button', { name: /Macro 15:00–16:45 · O-201C/ })).toBeVisible()
  await expect(seccion(page, 'Festivos').getByText('La Almudena')).toBeVisible()
  await expect(page.getByLabel('Hasta')).toHaveValue('2026-12-08')
})

test('añadir un festivo', async ({ page }) => {
  await page.getByRole('button', { name: 'Añadir: Festivos' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo festivo' })
  await hoja.getByLabel('Fecha').fill('2026-10-13')
  await hoja.getByLabel('Nombre (opcional)').fill('Puente')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(seccion(page, 'Festivos').getByText('Puente')).toBeVisible()
})

test('editar el aula de una clase semanal', async ({ page }) => {
  await seccion(page, 'Horario semanal').getByRole('button', { name: /Macro 15:00–16:45/ }).first().click()
  const hoja = page.getByRole('dialog', { name: 'Editar clase semanal' })
  await hoja.getByLabel('Aula (opcional)').fill('Aula Magna')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(seccion(page, 'Horario semanal').getByText('15:00–16:45 · Aula Magna')).toBeVisible()
})

test('no deja guardar una clase que termina antes de empezar', async ({ page }) => {
  await page.getByRole('button', { name: 'Añadir: Horario semanal' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nueva clase semanal' })
  await hoja.getByLabel('Asignatura').selectOption({ label: 'Macroeconomía' })
  await hoja.getByLabel('Empieza').fill('18:00')
  await hoja.getByLabel('Termina').fill('17:00')
  await expect(hoja.getByText('La hora de fin tiene que ser posterior')).toBeVisible()
  await expect(hoja.getByRole('button', { name: 'Guardar' })).toBeDisabled()
})

test('borrar una asignatura borra también sus clases', async ({ page }) => {
  const puntuales = seccion(page, 'Clases puntuales')
  await expect(puntuales.getByText(/Comunicación/).first()).toBeVisible()
  await seccion(page, 'Asignaturas').getByRole('button', { name: 'Comunicación Persuasiva' }).click()
  const hoja = page.getByRole('dialog', { name: 'Editar asignatura' })
  await hoja.getByRole('button', { name: 'Borrar' }).click()
  await hoja.getByRole('button', { name: '¿Seguro? Borrar' }).click()
  await expect(seccion(page, 'Asignaturas').getByRole('listitem')).toHaveCount(7)
  await expect(puntuales.getByText(/Comunicación/)).toHaveCount(0)
})

import { expect, test } from '@playwright/test'

// Reloj fijo: lunes 5 de octubre de 2026 a las 17:30 (Macro ya ha terminado, Bases de Datos está en curso).
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T17:30:00+02:00'))
  await page.goto('/#/calendario')
  await expect(page.getByRole('heading', { level: 1, name: 'Calendario' })).toBeVisible()
})

const detalle = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Día seleccionado' })

test('la vista mes muestra el examen y el día de hoy con sus clases', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await expect(page.getByRole('heading', { name: 'octubre 2026' })).toBeVisible()
  await expect(page.getByRole('gridcell', { name: /^5: .*Examen de Macro/ })).toBeVisible()
  await expect(detalle(page).getByText('Hoy, lunes, 5 de octubre')).toBeVisible()
  await expect(detalle(page).getByRole('button', { name: 'Macro: fui. Tocar si no fuiste' })).toBeVisible()
  await expect(detalle(page).getByRole('button', { name: /Bases de Datos: pendiente/ })).toHaveText('Ahora')
  await expect(detalle(page).getByRole('button', { name: /English: pendiente/ })).toHaveText('Pendiente')
})

test('marcar que no fui a clase y deshacerlo', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await detalle(page).getByRole('button', { name: 'Macro: fui. Tocar si no fuiste' }).click()
  await expect(detalle(page).getByRole('button', { name: /Macro: no fui/ })).toHaveText('No fui')
  await page.reload()
  await expect(detalle(page).getByRole('button', { name: /Macro: no fui/ })).toBeVisible()
  await detalle(page).getByRole('button', { name: /Macro: no fui/ }).click()
  await expect(detalle(page).getByRole('button', { name: 'Macro: fui. Tocar si no fuiste' })).toBeVisible()
})

test('avisar de que no iré a una clase futura', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await detalle(page).getByRole('button', { name: /English: pendiente/ }).click()
  await expect(detalle(page).getByRole('button', { name: /English: no iré/ })).toHaveText('No iré')
})

test('un festivo no tiene clases', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await page.getByRole('gridcell', { name: /^12: festivo/ }).click()
  await expect(detalle(page).getByText('Festivo · Fiesta Nacional de España')).toBeVisible()
  await expect(detalle(page).getByRole('list', { name: 'Clases' })).toHaveCount(0)
})

test('la vista semana muestra de lunes a domingo y se puede avanzar', async ({ page }) => {
  await page.getByRole('radio', { name: 'Semana' }).click()
  await expect(page.getByRole('heading', { name: '5 oct – 11 oct' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'lunes, 5 de octubre' }).getByText('Examen de Macro')).toBeVisible()
  await expect(page.getByRole('region', { name: 'viernes, 9 de octubre' }).getByText(/Comunicación/)).toBeVisible()
  await page.getByRole('button', { name: 'Semana siguiente' }).click()
  await expect(page.getByRole('heading', { name: '12 oct – 18 oct' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'miércoles, 14 de octubre' }).getByText(/Práctica/)).toBeVisible()
  await page.getByRole('button', { name: 'Hoy', exact: true }).click()
  await expect(page.getByRole('heading', { name: '5 oct – 11 oct' })).toBeVisible()
})

test('añadir un evento a un día', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await page.getByRole('gridcell', { name: /^7/ }).first().click()
  await detalle(page).getByRole('button', { name: 'Evento' }).click()
  const hoja = page.getByRole('dialog', { name: 'Nuevo evento' })
  await expect(hoja.getByLabel('Fecha')).toHaveValue('2026-10-07')
  await hoja.getByLabel('Qué').fill('Médico')
  await hoja.getByLabel('Empieza (opcional)').fill('10:00')
  await hoja.getByRole('button', { name: 'Guardar' }).click()
  await expect(detalle(page).getByText('Médico')).toBeVisible()
  await expect(page.getByRole('gridcell', { name: /^7: Médico/ })).toBeVisible()
})

test('resumen de asistencia por asignatura', async ({ page }) => {
  await page.getByRole('radio', { name: 'Mes' }).click()
  await detalle(page).getByRole('button', { name: 'Macro: fui. Tocar si no fuiste' }).click()
  await page.getByRole('button', { name: /Asistencia/ }).click()
  await expect(page.getByText(/% en lo que va de cuatrimestre/)).toBeVisible()
  // Macro: lunes y viernes desde el 7 sep hasta hoy = 9 clases, 1 falta
  await expect(page.getByText('89 % · 8/9')).toBeVisible()
})

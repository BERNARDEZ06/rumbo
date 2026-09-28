import { expect, test, type Page } from '@playwright/test'

const bloque = (page: Page, nombre: string) => page.getByRole('region', { name: nombre })

test.describe('lunes 5 de octubre a las 17:30', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-05T17:30:00+02:00'))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Hoy' })).toBeVisible()
  })

  test('saluda y muestra la fecha', async ({ page }) => {
    await expect(page.getByText('Buenas tardes · lunes, 5 de octubre')).toBeVisible()
  })

  test('cuenta atrás de los próximos exámenes', async ({ page }) => {
    const cuenta = bloque(page, 'Próximos exámenes')
    await expect(cuenta.getByRole('button', { name: 'Examen de Macro: hoy' })).toBeVisible()
    await expect(cuenta.getByRole('button', { name: 'Examen de Contabilidad: en 3 días' })).toBeVisible()
    await expect(cuenta.getByRole('button', { name: 'Mock de Estadística: en 5 días' })).toBeVisible()
  })

  test('tareas de hoy: marcar la entrega como hecha', async ({ page }) => {
    const tareas = bloque(page, 'Tareas para hoy')
    await expect(tareas.getByText('Examen de Macro')).toBeVisible()
    await expect(tareas.getByText('0/2 hechas')).toBeVisible()
    await tareas.getByRole('button', { name: 'Marcar Entrega de Macroeconomía como hecha' }).click()
    await expect(tareas.getByText('1/2 hechas')).toBeVisible()
    await expect(tareas.getByText('Entrega de Macroeconomía')).toBeVisible() // se queda tachada
  })

  test('clases de hoy con su asistencia', async ({ page }) => {
    const clases = bloque(page, 'Clases')
    await expect(clases.getByText('2 por delante')).toBeVisible()
    await expect(clases.getByRole('button', { name: 'Macro: fui. Tocar si no fuiste' })).toBeVisible()
    await expect(clases.getByRole('button', { name: /Bases de Datos: pendiente/ })).toHaveText('Ahora')
  })

  test('hábitos: marcar gimnasio y apuntar estudio', async ({ page }) => {
    const habitos = bloque(page, 'Hábitos')
    await habitos.getByRole('button', { name: 'Marcar Gimnasio hoy' }).click()
    await expect(habitos.getByText('1 de 4 días esta semana')).toBeVisible()
    await habitos.getByRole('button', { name: 'Apuntar tiempo de Estudiar' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '+2h' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Hecho' }).click()
    await expect(habitos.getByText('2 h de 14 h esta semana')).toBeVisible()
  })
})

test('un festivo se anuncia y no hay clases', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-12T10:00:00+02:00'))
  await page.goto('/')
  await expect(page.getByText('Buenos días · lunes, 12 de octubre')).toBeVisible()
  await expect(bloque(page, 'Clases').getByText('Festivo · Fiesta Nacional de España. ¡Sin clases!')).toBeVisible()
})

test('un sábado sin clases ni tareas', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-03T22:00:00+02:00'))
  await page.goto('/')
  await expect(page.getByText('Buenas noches · sábado, 3 de octubre')).toBeVisible()
  await expect(bloque(page, 'Clases').getByText('Hoy no tienes clase.')).toBeVisible()
  await expect(bloque(page, 'Tareas para hoy').getByText('Nada pendiente para hoy.')).toBeVisible()
})

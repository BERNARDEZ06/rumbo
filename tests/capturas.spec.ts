import { test } from '@playwright/test'

// Genera capturas para revisar el diseño a ojo (no falla nunca por diseño).
for (const tema of ['claro', 'oscuro'] as const) {
  test(`capturas en modo ${tema}`, async ({ page }, info) => {
    await page.addInitScript((t) => localStorage.setItem('rumbo.tema', t), tema)
    const foto = (nombre: string) => page.screenshot({ path: `test-results/capturas/${info.project.name}-${tema}-${nombre}.png` })

    for (const [nombre, ruta] of [['hoy', '/'], ['ajustes', '/#/ajustes']]) {
      await page.goto(ruta)
      await page.waitForTimeout(400)
      await foto(nombre)
    }

    // Hábitos con algo de actividad
    await page.goto('/#/habitos')
    const gim = page.getByRole('article').filter({ hasText: 'Gimnasio' })
    await gim.getByRole('button', { name: 'Marcar Gimnasio hoy' }).click()
    await page.getByRole('button', { name: 'Apuntar tiempo de Estudiar' }).click()
    await page.getByRole('dialog').getByRole('button', { name: '+1h30' }).click()
    await page.waitForTimeout(300)
    await foto('apuntar-minutos')
    await page.getByRole('dialog').getByRole('button', { name: 'Hecho' }).click()
    await page.waitForTimeout(300)
    await foto('habitos')

    await page.getByRole('button', { name: 'Nuevo' }).click()
    await page.waitForTimeout(300)
    await foto('nuevo-habito')
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Añadir' }).filter({ visible: true }).click()
    await page.waitForTimeout(300)
    await foto('anadir')
  })
}

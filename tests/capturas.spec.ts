import { test } from '@playwright/test'

// Genera capturas para revisar el diseño a ojo (no falla nunca por diseño).
for (const tema of ['claro', 'oscuro'] as const) {
  test(`capturas en modo ${tema}`, async ({ page }, info) => {
    await page.addInitScript((t) => localStorage.setItem('rumbo.tema', t), tema)
    for (const [nombre, ruta] of [['hoy', '/'], ['ajustes', '/#/ajustes']]) {
      await page.goto(ruta)
      await page.waitForTimeout(400)
      await page.screenshot({ path: `test-results/capturas/${info.project.name}-${tema}-${nombre}.png` })
    }
    await page.goto('/')
    await page.getByRole('button', { name: 'Añadir' }).filter({ visible: true }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `test-results/capturas/${info.project.name}-${tema}-anadir.png` })
  })
}

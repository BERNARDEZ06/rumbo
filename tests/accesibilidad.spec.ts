import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Revisión automática de accesibilidad (contraste, nombres de botones, etiquetas…) en cada pantalla,
// en modo claro y oscuro. Solo se aceptan problemas leves.
const PANTALLAS = ['/', '/#/calendario', '/#/tareas', '/#/habitos', '/#/ajustes', '/#/ajustes/clases']

for (const tema of ['claro', 'oscuro'] as const) {
  test(`accesibilidad en modo ${tema}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-05T17:30:00+02:00'))
    await page.addInitScript((t) => localStorage.setItem('rumbo.tema', t), tema)
    for (const ruta of PANTALLAS) {
      await page.goto(ruta)
      await page.waitForTimeout(300)
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      const graves = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(
        graves.map((v) => `${ruta} · ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`),
        `problemas en ${ruta}`,
      ).toEqual([])
    }
  })
}

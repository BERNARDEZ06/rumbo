import { test } from '@playwright/test'

// Genera capturas para revisar el diseño a ojo (no falla nunca por diseño).
for (const tema of ['claro', 'oscuro'] as const) {
  test(`capturas en modo ${tema}`, async ({ page }, info) => {
    // Siempre el mismo momento: lunes 5 oct 2026, 17:30 (hay examen, clases terminadas y en curso).
    await page.clock.setFixedTime(new Date('2026-10-05T17:30:00+02:00'))
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

    await page.getByRole('article').filter({ hasText: 'Estudiar' }).getByRole('button', { name: 'Ajustar esta semana' }).click()
    await page.waitForTimeout(300)
    await foto('ajustar-semana')
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Nuevo' }).click()
    await page.waitForTimeout(300)
    await foto('nuevo-habito')
    await page.keyboard.press('Escape')

    await page.keyboard.press('Escape')
    for (const vista of ['Mes', 'Semana']) {
      await page.goto('/#/calendario')
      await page.getByRole('radio', { name: vista }).click()
      await page.waitForTimeout(400)
      await foto(`calendario-${vista.toLowerCase()}`)
    }
    await page.getByRole('radio', { name: 'Mes' }).click()

    await page.goto('/#/tareas')
    await page.waitForTimeout(400)
    await foto('tareas')
    await page.getByRole('button', { name: 'Abrir Examen de Macro' }).click()
    await page.waitForTimeout(300)
    await foto('editar-tarea')
    await page.keyboard.press('Escape')
    await page.goto('/#/ajustes/clases')
    await page.waitForTimeout(400)
    await foto('clases')
    await page.getByRole('button', { name: 'Añadir: Horario semanal' }).click()
    await page.waitForTimeout(300)
    await foto('nueva-clase')
    await page.keyboard.press('Escape')

    await page.getByRole('button', { name: 'Añadir', exact: true }).filter({ visible: true }).click()
    await page.waitForTimeout(300)
    await foto('anadir')
  })
}

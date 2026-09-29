// Genera los iconos PNG de la app a partir de public/icono.svg (usa el navegador de las pruebas).
// Uso: node scripts/iconos.mjs
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/icono.svg', 'utf8')
const TAMAÑOS = [
  ['public/apple-touch-icon.png', 180],
  ['public/icono-192.png', 192],
  ['public/icono-512.png', 512],
]

const navegador = await chromium.launch()
const pagina = await navegador.newPage()
for (const [ruta, lado] of TAMAÑOS) {
  await pagina.setViewportSize({ width: lado, height: lado })
  await pagina.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body></html>`)
  await pagina.screenshot({ path: ruta, clip: { x: 0, y: 0, width: lado, height: lado } })
  console.log('✓', ruta)
}
await navegador.close()

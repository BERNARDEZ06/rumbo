import { defineConfig, devices } from '@playwright/test'

// Pruebas en un navegador de verdad, en tamaño móvil (iPhone) y ordenador.
// El proyecto "publicada" prueba la versión final tal y como estará en GitHub Pages (instalable y sin conexión).
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  use: { baseURL: 'http://localhost:5173', locale: 'es-ES', timezoneId: 'Europe/Madrid' },
  projects: [
    { name: 'movil', testIgnore: /publicada/, use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 }, browserName: 'chromium' } },
    { name: 'ordenador', testIgnore: /publicada/, use: { viewport: { width: 1280, height: 800 } } },
    { name: 'publicada', testMatch: /publicada/, use: { baseURL: 'http://localhost:4173/rumbo/', viewport: { width: 375, height: 812 } } },
  ],
  webServer: [
    { command: 'npx vite --port 5173 --strictPort', url: 'http://localhost:5173', reuseExistingServer: true },
    { command: 'npm run build && node scripts/servir-dist.mjs', url: 'http://localhost:4173/rumbo/', reuseExistingServer: true, timeout: 120_000 },
  ],
})

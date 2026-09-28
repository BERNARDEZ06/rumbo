import { defineConfig, devices } from '@playwright/test'

// Pruebas en un navegador de verdad, en tamaño móvil (iPhone) y ordenador.
export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results',
  use: { baseURL: 'http://localhost:5173', locale: 'es-ES', timezoneId: 'Europe/Madrid' },
  projects: [
    { name: 'movil', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 }, browserName: 'chromium' } },
    { name: 'ordenador', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'npx vite --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})

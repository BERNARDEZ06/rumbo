/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Las pruebas usan siempre la hora de Madrid, para que den lo mismo en cualquier ordenador.
process.env.TZ = 'Europe/Madrid'

// base './' hace que la app funcione en cualquier carpeta (GitHub Pages incluido).
export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(JSON.parse(readFileSync('package.json', 'utf8')).version) },
  plugins: [
    react(),
    tailwindcss(),
    // App instalable (PWA): ficha de la app (manifest) y un "service worker" que guarda
    // la app en el dispositivo para que funcione sin conexión y se actualice sola.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Rumbo · hábitos, clases y tareas',
        short_name: 'Rumbo',
        description: 'Tus hábitos, tu horario de clase, tus exámenes y tareas, en un solo sitio.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f7f9',
        theme_color: '#4f46e5',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})

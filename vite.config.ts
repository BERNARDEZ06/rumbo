/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las pruebas usan siempre la hora de Madrid, para que den lo mismo en cualquier ordenador.
process.env.TZ = 'Europe/Madrid'

// base './' hace que la app funcione en cualquier carpeta (GitHub Pages incluido).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})

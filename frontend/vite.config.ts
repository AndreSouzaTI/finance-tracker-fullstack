/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, as chamadas /api vão para o Spring Boot
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    rollupOptions: {
      // Biblioteca de gráficos em um arquivo separado, cacheado independente do código da aplicação
      output: { manualChunks: { charts: ['recharts'] } },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

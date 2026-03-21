/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'src/test/setup.ts',
        '**/*.{test,spec}.{ts,tsx}',
        'src/main.tsx',
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('/react/') || id.includes('/react-dom/')) return 'react'
          if (
            id.includes('/@reduxjs/') ||
            id.includes('/react-redux/') ||
            id.includes('/redux-persist/')
          ) {
            return 'redux'
          }
          if (id.includes('/i18next/') || id.includes('/react-i18next/')) return 'i18n'
          if (
            id.includes('/lucide-react/') ||
            id.includes('/motion/') ||
            id.includes('/@radix-ui/')
          ) {
            return 'ui'
          }

          return 'vendor'
        },
      },
    },
  },
})

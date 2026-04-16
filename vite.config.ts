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
          if (!id.includes('node_modules')) return

          if (
            id.includes('/@reduxjs/') ||
            id.includes('/react-redux/') ||
            id.includes('/redux-persist/')
          ) {
            return 'vendor-state'
          }

          const isReactPackage =
            /\/node_modules\/react(\/|$)/.test(id) ||
            /\/node_modules\/react-dom(\/|$)/.test(id)

          if (isReactPackage) {
            return 'vendor-react'
          }

          if (id.includes('/i18next/') || id.includes('/react-i18next/')) {
            return 'vendor-i18n'
          }

          if (
            id.includes('/@radix-ui/') ||
            id.includes('/motion/') ||
            id.includes('/lucide-react/')
          ) {
            return 'vendor-ui'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})

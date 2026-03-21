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
        manualChunks: {
          react: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          i18n: ['i18next', 'react-i18next'],
          ui: ['lucide-react', 'motion', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})

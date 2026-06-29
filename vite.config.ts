/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json') as { version: string }

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Грузим .env / .env.local (и process.env) — пустой префикс = все переменные.
  const env = loadEnv(mode, process.cwd(), '')

  // Версия клиента для заголовка x-client-version. Приоритет:
  //   VITE_APP_VERSION (.env / CI) → короткий git SHA из CI (Vercel) → версия из package.json.
  const appVersion = env.VITE_APP_VERSION || env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || pkg.version

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
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
    server: {
      port: env.PORT ? Number(env.PORT) : 5174,
    },
    build: {
      // Не добавлять manualChunks: разнос react / redux-persist / motion по vendor-чанкам
      // вызывал циклические импорты и падение «d.Component» в Telegram WebView.
      chunkSizeWarningLimit: 650,
    },
  }
})

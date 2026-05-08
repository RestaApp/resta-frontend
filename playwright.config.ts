import { defineConfig, devices } from '@playwright/test'

/**
 * Visual regression smoke‑тесты для Resta Mini App.
 *
 * Цель — поймать визуальные регрессии на ключевых экранах в обеих темах.
 * НЕ полноценный e2e — только screenshot diffs на seed‑данных и при отсутствии
 * Telegram‑контекста (приложение должно подниматься в браузере по DEV‑пути).
 *
 * Команды:
 *   npm run test:visual          — прогон тестов
 *   npm run test:visual:update   — пересохранить эталоны после намеренных изменений
 */
export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__snapshots__',

  // CI/local detect
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // dev‑server поднимается перед запуском (если не запущен снаружи).
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  use: {
    baseURL: 'http://localhost:5173',
    // Устойчивость скриншотов: отключаем animations, фиксируем viewport.
    trace: 'retain-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      // Допуск на anti‑aliasing разницу между средами (CI/local).
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'mobile-iphone-13',
      use: { ...devices['iPhone 13'] },
    },
  ],
})

import { test, expect } from '@playwright/test'

/**
 * Smoke visual regression — снимки ключевых экранов в обеих темах.
 *
 * Окружение:
 *  • dev‑сервер через `webServer` в playwright.config.ts;
 *  • Telegram WebApp недоступен → приложение поднимается через DEV fallback
 *    («Роли не найдены» при отсутствии MOCK_INIT_DATA сессии).
 *
 * Если в будущем нужен живой mock авторизации — добавить fixture с подменой
 * `localStorage` (token, user data) перед `page.goto`.
 */

const THEMES = ['dark', 'light'] as const

const setTheme = async (page: import('@playwright/test').Page, theme: 'dark' | 'light') => {
  await page.addInitScript((value: string) => {
    localStorage.setItem('resta-theme', value)
  }, theme)
}

const stabilizePage = async (page: import('@playwright/test').Page) => {
  // Фиксируем «9:41 AM» дату для детерминизма (в т.ч. для splash экрана).
  await page.addInitScript(() => {
    const FIXED_TIME = new Date('2026-05-08T09:41:00Z').getTime()
    const RealDate = Date
    // @ts-expect-error mock
    globalThis.Date = class extends RealDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) super(FIXED_TIME)
        else super(...args)
      }
      static now() {
        return FIXED_TIME
      }
    }
  })
}

for (const theme of THEMES) {
  test.describe(`visual / ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await stabilizePage(page)
      await setTheme(page, theme)
    })

    test('boot screen', async ({ page }) => {
      await page.goto('/')
      // Ждём пока spinner исчезнет или таймаут — в любом случае получим
      // стабильную картинку «Роли не найдены» / loading state.
      await page.waitForLoadState('networkidle').catch(() => {})
      // Дополнительный wait, чтобы layout успел стабилизироваться.
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot(`boot.${theme}.png`, { fullPage: false })
    })
  })
}

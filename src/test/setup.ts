/**
 * Глобальная настройка Vitest: матчеры @testing-library/jest-dom + авто-cleanup
 * React Testing Library после каждого теста (размонтирование, чтобы рендеры
 * не накапливались в document.body между тестами).
 */
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

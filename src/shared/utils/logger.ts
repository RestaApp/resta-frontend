/**
 * Утилита для логирования.
 * Здесь логирование включено только в режиме разработки (import.meta.env.DEV).
 * В production все методы являются no-op, чтобы убрать лишнее логирование.
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args)
    }
    // В production можно отправлять ошибки в внешнюю систему мониторинга,
    // но по задаче убираем вывод в консоль.
  },
}

/**
 * Утилита для логирования
 * В production режиме логи не выводятся
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
    // Ошибки логируем всегда, но в production можно отправлять в систему мониторинга
    console.error(...args)
  },
}

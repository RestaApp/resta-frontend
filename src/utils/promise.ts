/**
 * Утилита для проверки, является ли значение промисом
 * Используется для безопасной проверки возвращаемых значений функций
 */

/**
 * Проверяет, является ли значение промисом
 * @param value - Значение для проверки
 * @returns true, если значение является промисом
 */
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> => {
  return (
    value !== undefined &&
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof (value as Promise<T>).then === 'function'
  )
}

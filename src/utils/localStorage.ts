/**
 * Утилита для безопасной работы с localStorage
 * Обеспечивает проверку доступности window и обработку ошибок
 */

/**
 * Проверяет, доступен ли localStorage
 */
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Безопасно получает значение из localStorage
 */
export const getLocalStorageItem = (key: string): string | null => {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Безопасно сохраняет значение в localStorage
 */
export const setLocalStorageItem = (key: string, value: string): void => {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.setItem(key, value)
  } catch {
    // Игнорируем ошибки записи (например, при превышении квоты)
  }
}

/**
 * Безопасно удаляет значение из localStorage
 */
export const removeLocalStorageItem = (key: string): void => {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch {
    // Игнорируем ошибки удаления
  }
}

/**
 * Безопасно очищает весь localStorage
 */
export const clearLocalStorage = (): void => {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.clear()
  } catch {
    // Игнорируем ошибки очистки
  }
}


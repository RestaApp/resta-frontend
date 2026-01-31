/**
 * Утилиты для ввода и валидации телефона в международном формате.
 * Поддерживается формат +375-XX-XXX-XX-XX (Беларусь) с автоподстановкой.
 */

const BELARUS_MOBILE_CODES = ['29', '33', '44', '25'] as const

/** Извлечь только цифры из строки */
export function parsePhoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Форматирование при вводе: автоподстановка +375 для Беларуси,
 * маска +375-XX-XXX-XX-XX. Если пользователь начинает с 8 — подставляем +375.
 */
export function formatPhoneInput(raw: string): string {
  const digits = parsePhoneDigits(raw)

  if (digits.length === 0) return ''

  // 80... (11 цифр) и 8... (до 11) — подставляем +375; проверять 80 до 8
  let normalized = digits
  if (digits.startsWith('80') && digits.length <= 12) {
    normalized = '375' + digits.slice(2)
  } else if (digits.startsWith('8') && digits.length <= 11) {
    normalized = '375' + digits.slice(1)
  } else if (
    digits.length >= 2 &&
    digits.length <= 9 &&
    !digits.startsWith('375') &&
    BELARUS_MOBILE_CODES.some((code) => digits === code || digits.startsWith(code))
  ) {
    // Начинает с кода оператора Беларуси (29, 33, 44, 25) — подставляем +375
    normalized = '375' + digits
  }

  // Беларусь: +375-XX-XXX-XX-XX (9 цифр после 375)
  if (normalized.startsWith('375')) {
    const rest = normalized.slice(3, 12)
    const parts: string[] = ['+375']
    if (rest.length <= 2) {
      parts.push(rest)
    } else {
      parts.push(rest.slice(0, 2))
      if (rest.length > 2) parts.push(rest.slice(2, 5))
      if (rest.length > 5) parts.push(rest.slice(5, 7))
      if (rest.length > 7) parts.push(rest.slice(7, 9))
    }
    return parts.filter(Boolean).join('-')
  }

  // Россия: +7-XXX-XXX-XX-XX
  if (normalized.startsWith('7') && normalized.length <= 11) {
    const rest = normalized.slice(1, 11)
    const parts: string[] = ['+7']
    if (rest.length <= 3) {
      parts.push(rest)
    } else {
      parts.push(rest.slice(0, 3))
      if (rest.length > 3) parts.push(rest.slice(3, 6))
      if (rest.length > 6) parts.push(rest.slice(6, 8))
      if (rest.length > 8) parts.push(rest.slice(8, 10))
    }
    return parts.filter(Boolean).join('-')
  }

  // Другие коды: + и группы по 2–3 цифры (до 15 цифр)
  const code = normalized.length <= 3 ? normalized : normalized.slice(0, 3)
  const rest = normalized.slice(code.length, 15)
  const formatted = rest.replace(/(\d{2,3})(?=\d)/g, '$1-')
  return '+' + code + (formatted ? '-' + formatted : '')
}

/**
 * Вернуть номер в E.164 для отправки на бэкенд: только + и цифры.
 */
export function toE164(formatted: string): string {
  const digits = parsePhoneDigits(formatted)
  if (digits.length === 0) return ''
  // 8 29... → +37529...
  if (digits.startsWith('8') && digits.length === 10) {
    return '+375' + digits.slice(1)
  }
  if (digits.startsWith('80') && digits.length === 11) {
    return '+375' + digits.slice(2)
  }
  if (digits.startsWith('375')) return '+' + digits.slice(0, 12)
  if (digits.startsWith('7')) return '+' + digits.slice(0, 11)
  return '+' + digits.slice(0, 15)
}

export interface PhoneValidation {
  valid: boolean
  message?: string
}

/**
 * Валидация: международный формат, от 10 до 15 цифр (E.164).
 */
export function validatePhone(value: string): PhoneValidation {
  const trimmed = value.trim()
  if (!trimmed) {
    return { valid: false, message: 'Введите номер телефона' }
  }

  const digits = parsePhoneDigits(trimmed)

  // Только цифры и допустимые символы в начале
  if (!/^\+?[\d\s\-()]*$/.test(trimmed)) {
    return { valid: false, message: 'Допустимы только цифры и символ + в начале' }
  }

  if (digits.length < 10) {
    return { valid: false, message: 'Номер слишком короткий. Пример: +375-29-123-45-67' }
  }

  if (digits.length > 15) {
    return { valid: false, message: 'Номер слишком длинный' }
  }

  // Беларусь: 375 + 9 цифр
  if (digits.startsWith('375')) {
    if (digits.length !== 12) {
      return { valid: false, message: 'Для Беларуси: +375 и 9 цифр. Пример: +375-29-123-45-67' }
    }
    const mobileCode = digits.slice(3, 5)
    if (!BELARUS_MOBILE_CODES.includes(mobileCode as (typeof BELARUS_MOBILE_CODES)[number])) {
      return { valid: false, message: 'Неверный код оператора. Допустимы: 29, 33, 44, 25' }
    }
  }

  // Россия: 7 + 10 цифр
  if (digits.startsWith('7') && digits.length !== 11) {
    return { valid: false, message: 'Для России: +7 и 10 цифр' }
  }

  return { valid: true }
}

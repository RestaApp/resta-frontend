import type { TFunction } from 'i18next'
import { formatMoney, parseMoneyInput } from '@/shared/shifts/formatting'
import { toMinutes } from '@/shared/utils/datetime'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

/** SRP: чистые функции валидации формы AddShift. Никаких React/Redux зависимостей. */

/** Максимальная оплата в основных единицах валюты (бэкенд: payment < 100_000_000 в копейках). */
export const MAX_SHIFT_PAYMENT = 1_000_000

export type AddShiftFieldErrors = Partial<
  Record<'location' | 'city' | 'requirements' | 'description' | 'specializations' | 'pay', string>
>

const paymentTooHighMessage = (t: TFunction): string =>
  t('validation.paymentTooHigh', { max: formatMoney(MAX_SHIFT_PAYMENT) })

export const isPaymentLimitServerError = (error: string): boolean => {
  const lower = error.toLowerCase()
  return (
    lower.includes('payment must be less than') ||
    (lower.includes('payment') && lower.includes('less than'))
  )
}

export const validatePayment = (pay: string, t: TFunction): string | null => {
  const amount = parseMoneyInput(pay)
  if (amount === null || amount <= MAX_SHIFT_PAYMENT) return null
  return paymentTooHighMessage(t)
}

export const validateTimeRange = (
  startTime: string,
  endTime: string,
  t: TFunction
): string | null => {
  if (!startTime || !endTime) return null
  const startMinutes = toMinutes(startTime)
  const endMinutes = toMinutes(endTime)
  if (startMinutes === null || endMinutes === null) return t('validation.invalidTime')
  // Ночная смена: конец < начала — допустимо (на следующий день).
  if (endMinutes < startMinutes) return null
  if (endMinutes === startMinutes) return t('validation.timeEndAfterStart')
  return null
}

export const validateDate = (
  date: string | null,
  startTime: string,
  t: TFunction
): string | null => {
  if (!date) return null
  const selectedDate = new Date(date + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (selectedDate < today) return t('validation.dateInFuture')
  if (selectedDate.getTime() === today.getTime() && startTime) {
    const [hours, minutes] = startTime.split(':').map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const selectedDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0,
        0
      )
      if (selectedDateTime <= now) return t('validation.timeInFuture')
    }
  }
  return null
}

/**
 * Проверка: нет ли уже активной смены с такой же позицией.
 * Активна = end_time в будущем (или start_time если end_time нет).
 */
export const findDuplicatePosition = (
  existingShifts: VacancyApiItem[],
  position: string,
  currentId: number | undefined
): boolean => {
  if (!position || existingShifts.length === 0) return false
  const now = new Date()

  return existingShifts.some(shift => {
    if (currentId && shift.id === currentId) return false
    if (shift.position !== position) return false
    if (!shift.start_time) return false

    try {
      if (shift.end_time) {
        const shiftEndDate = new Date(shift.end_time)
        return shiftEndDate >= now
      }
      const shiftStartDate = new Date(shift.start_time)
      return shiftStartDate >= now
    } catch {
      return true
    }
  })
}

/**
 * Перевод серверной ошибки в локализованный текст.
 * Возвращает оригинал, если совпадений не нашли.
 */
export const translateServerError = (error: string, t: TFunction): string => {
  const lower = error.toLowerCase()
  if (
    lower.includes("specialization can't be blank") ||
    lower.includes('specialization is required') ||
    lower.includes('специализация обязательна')
  ) {
    return t('validation.specializationRequired')
  }
  if (lower.includes("description can't be blank") || lower.includes('описание')) {
    return t('validation.requiredField')
  }
  if (
    lower.includes("requirements can't be blank") ||
    lower.includes('требования') ||
    lower.includes('requirements')
  ) {
    return t('validation.requiredField')
  }
  if (lower.includes("location can't be blank") || lower.includes('локац')) {
    return t('validation.requiredField')
  }
  if (isPaymentLimitServerError(error)) {
    return paymentTooHighMessage(t)
  }
  if (lower.includes('active shift') || lower.includes('позицией') || lower.includes('position')) {
    return t('validation.duplicatePosition')
  }
  if (lower.includes("can't be blank") || lower.includes('is required')) {
    return t('validation.fillRequired')
  }
  return error
}

/**
 * Чистый mapper серверных ошибок в `{ fieldErrors, generalMessage }`.
 * Никакой React‑state — установка значений в state делается на стороне хука.
 */
export const mapServerErrorsToFields = (
  errors: string[],
  t: TFunction
): { fieldErrors: AddShiftFieldErrors; generalMessage: string } => {
  const fieldErrors: AddShiftFieldErrors = {}
  const generalMessages: string[] = []

  for (const raw of errors) {
    const msg = String(raw || '').trim()
    if (!msg) continue
    const lower = msg.toLowerCase()

    if (lower.includes('specialization')) {
      fieldErrors.specializations = t('validation.specializationRequired')
      continue
    }
    if (lower.includes('description')) {
      fieldErrors.description = t('validation.requiredField')
      continue
    }
    if (lower.includes('requirements')) {
      fieldErrors.requirements = t('validation.requiredField')
      continue
    }
    if (lower.includes('city') || lower.includes('город')) {
      fieldErrors.city = t('validation.requiredField')
      continue
    }
    if (lower.includes('location')) {
      fieldErrors.location = t('validation.requiredField')
      continue
    }
    if (isPaymentLimitServerError(msg) || lower.includes('payment')) {
      fieldErrors.pay = paymentTooHighMessage(t)
      continue
    }

    generalMessages.push(translateServerError(msg, t))
  }

  const uniqueGeneral = Array.from(new Set(generalMessages)).filter(Boolean)
  return {
    fieldErrors,
    generalMessage: uniqueGeneral.join('; '),
  }
}

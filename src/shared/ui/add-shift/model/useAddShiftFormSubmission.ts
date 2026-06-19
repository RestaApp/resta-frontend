import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateShiftMutation,
  useUpdateShiftMutation,
  type CreateShiftResponse,
  type VacancyApiItem,
} from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { toMinutes, buildDateTime, addDaysToISODate } from '@/shared/utils/datetime'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { parseMoneyInput } from '@/shared/shifts/formatting'
import { normalizeCatalogPosition } from '@/shared/utils/roles'
import { sanitizeLocations } from '@/shared/utils/location'
import { useUpdateUser } from '@/shared/lib/hooks/useUsers'
import { useAppSelector } from '@/store/hooks'
import { mapServerErrorsToFields, translateServerError } from './addShiftValidation'
import { selectUserData } from '@/store/slices/userSlice'
import { usePurchaseFlow } from '@/features/monetization/purchaseFlowContext'
import { parsePaymentRequired } from '@/shared/lib/monetization/paymentRequired'
import { waitWithBackoff } from '@/shared/lib/monetization/waitWithBackoff'
import type { AddShiftFormState } from './useAddShiftFormState'

interface UseAddShiftFormSubmissionOptions {
  state: AddShiftFormState
  initialValues: VacancyApiItem | null
  onSave?: (shift: CreateShiftResponse | null) => void
  /** Pre-flight чек: false → submit отменён (не валидно). */
  canSubmit: () => boolean
  /** Текущий city пользователя — если форменный отличается, заранее обновляем user.city. */
  userCity?: string | null
}

interface ServerErrorBag {
  errors?: unknown
  message?: unknown
  error?: unknown
  feature?: unknown
}

const vacancyUniquenessToken = 'vacancy_uniqueness'

const toServerErrorMessages = (bag: ServerErrorBag): string[] => {
  if (bag.feature === vacancyUniquenessToken) {
    return [typeof bag.error === 'string' ? bag.error : vacancyUniquenessToken]
  }
  if (Array.isArray(bag.errors)) {
    return bag.errors.map(e => String(e))
  }
  if (typeof bag.message === 'string') return [bag.message]
  if (typeof bag.error === 'string') return [bag.error]
  return []
}

const extractServerErrors = (error: unknown): { messages?: string[]; single?: string } => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object') {
      const messages = toServerErrorMessages(data as ServerErrorBag)
      if (messages.length > 0) return { messages }
    }
  }
  if (error instanceof Error) return { single: error.message }
  return {}
}

const hasInlineErrors = (
  result: unknown
): result is { errors?: unknown; message?: unknown; success?: false } => {
  if (!result || typeof result !== 'object') return false
  const r = result as Record<string, unknown>
  return r.success === false || (Array.isArray(r.errors) && r.errors.length > 0) || !!r.errors
}

const inlineErrorMessages = (result: unknown): string[] => {
  if (!result || typeof result !== 'object') return []
  return toServerErrorMessages(result as ServerErrorBag)
}

/**
 * Submission flow для AddShift:
 *  • build payload из state;
 *  • вызов create или update мутации (RTK Query);
 *  • маппинг серверных ошибок в field errors / general message;
 *  • toast + reset form при успехе.
 *
 * Public surface — `{ handleSave, isCreating }`. Любые derived валидации,
 * которые блокируют submit, передаются через `canSubmit()` колбэк.
 */
export const useAddShiftFormSubmission = ({
  state,
  initialValues,
  onSave,
  canSubmit,
  userCity,
}: UseAddShiftFormSubmissionOptions) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
  const [updateShiftMutation] = useUpdateShiftMutation()
  const { updateUser } = useUpdateUser()
  const { requestPurchase } = usePurchaseFlow()
  const currentUser = useAppSelector(selectUserData)

  const applyServerErrors = useCallback(
    (errors: string[]) => {
      const { fieldErrors, generalMessage } = mapServerErrorsToFields(errors, t)
      state.setFieldErrors(fieldErrors)
      state.setSubmitError(generalMessage || null)
      return {
        hasFieldErrors: Object.keys(fieldErrors).length > 0,
        message: generalMessage,
      }
    },
    [state, t]
  )

  const handleSave = useCallback(async (): Promise<boolean> => {
    state.setSubmitError(null)
    state.setFieldErrors({})
    if (!canSubmit()) {
      triggerHapticFeedback('warning')
      return false
    }

    const requiresSchedule = state.shiftType === 'replacement'
    const startM = toMinutes(state.startTime)
    const endM = toMinutes(state.endTime)
    const isNightShift = startM !== null && endM !== null && endM <= startM
    const endDate = state.date
      ? isNightShift
        ? addDaysToISODate(state.date, 1)
        : state.date
      : null

    const payload = {
      shift: {
        title: state.title,
        description: state.description,
        ...(requiresSchedule
          ? {
              start_time: buildDateTime(state.date!, state.startTime),
              end_time: buildDateTime(endDate!, state.endTime),
            }
          : {}),
        payment: parseMoneyInput(state.pay) ?? undefined,
        location: sanitizeLocations(state.location),
        city: state.city.trim() || undefined,
        requirements: state.requirements,
        shift_type: state.shiftType,
        urgent: state.urgent,
        position: normalizeCatalogPosition(state.position),
        specializations: state.specializations.length > 0 ? state.specializations : undefined,
      },
    }

    // Если форменный city отличается от сохранённого user.city — обновляем пользователя
    // первым, чтобы бэкенд мог использовать его для фильтрации/валидации смены.
    const formCity = state.city.trim()
    const normalizedUserCity = (userCity ?? '').trim()
    if (formCity && formCity !== normalizedUserCity && currentUser?.id) {
      await updateUser(currentUser.id, { user: { city: formCity } })
    }

    try {
      let response: CreateShiftResponse | null = null

      if (initialValues?.id) {
        const updateResult = await updateShiftMutation({
          id: String(initialValues.id),
          body: payload.shift,
        }).unwrap()
        if (hasInlineErrors(updateResult)) {
          const { hasFieldErrors, message } = applyServerErrors(inlineErrorMessages(updateResult))
          if (message) showToast?.(message, 'error')
          else triggerHapticFeedback('warning')
          if (hasFieldErrors) return false
          return false
        }
        triggerHapticFeedback('success')
        response = null
      } else {
        try {
          const createResult = await createShift(payload).unwrap()
          if (hasInlineErrors(createResult)) {
            const { hasFieldErrors, message } = applyServerErrors(inlineErrorMessages(createResult))
            if (message) showToast?.(message, 'error')
            else triggerHapticFeedback('warning')
            if (hasFieldErrors) return false
            return false
          }
          response = createResult
          triggerHapticFeedback('success')
        } catch (error: unknown) {
          // 402 Payment Required → flow покупки слота, затем повтор создания.
          const paymentInfo = parsePaymentRequired(error)
          if (paymentInfo) {
            const paid = await requestPurchase(paymentInfo)
            if (!paid) return false
            // Webhook Telegram может прийти с задержкой — ретраим с backoff,
            // повторный 402 трактуем как «ещё не обработано».
            const retried = await waitWithBackoff(async () => {
              try {
                return await createShift(payload).unwrap()
              } catch (retryError: unknown) {
                if (parsePaymentRequired(retryError)) return null
                throw retryError
              }
            })
            if (!retried || hasInlineErrors(retried)) {
              const message = t('monetization.purchase.processing')
              state.setSubmitError(message)
              showToast?.(message, 'error')
              return false
            }
            response = retried
            triggerHapticFeedback('success')
          } else {
            const { messages, single } = extractServerErrors(error)
            const serverMessages = messages ?? (single ? [single] : [])
            if (serverMessages.length > 0) {
              const { message } = applyServerErrors(serverMessages)
              if (message) showToast?.(message, 'error')
              else triggerHapticFeedback('warning')
              return false
            }
            const errorMessage = translateServerError(t('shift.createError'), t)
            state.setSubmitError(errorMessage)
            showToast?.(errorMessage, 'error')
            return false
          }
        }
      }

      onSave?.(response ?? null)
      state.resetForm()
      return true
    } catch (error: unknown) {
      const { messages, single } = extractServerErrors(error)
      const serverMessages = messages ?? (single ? [single] : [])
      if (serverMessages.length > 0) {
        const { message } = applyServerErrors(serverMessages)
        if (message) showToast?.(message, 'error')
        else triggerHapticFeedback('warning')
        return false
      }
      const errorMessage = translateServerError(t('shift.updateError'), t)
      state.setSubmitError(errorMessage)
      showToast?.(errorMessage, 'error')
      return false
    }
  }, [
    state,
    canSubmit,
    initialValues,
    updateShiftMutation,
    createShift,
    onSave,
    showToast,
    applyServerErrors,
    t,
    userCity,
    currentUser,
    updateUser,
    requestPurchase,
  ])

  return { handleSave, isCreating }
}

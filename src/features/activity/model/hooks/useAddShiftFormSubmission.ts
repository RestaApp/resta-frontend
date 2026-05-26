import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateShiftMutation,
  useUpdateShiftMutation,
  type CreateShiftResponse,
  type VacancyApiItem,
} from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { toMinutes, buildDateTime, addDaysToISODate } from '@/utils/datetime'
import { triggerHapticFeedback } from '@/utils/haptics'
import { parseMoneyInput } from '@/features/feed/model/utils/formatting'
import { mapServerErrorsToFields, translateServerError } from '../utils/addShiftValidation'
import type { AddShiftFormState } from './useAddShiftFormState'

interface UseAddShiftFormSubmissionOptions {
  state: AddShiftFormState
  initialValues: VacancyApiItem | null
  onSave?: (shift: CreateShiftResponse | null) => void
  /** Pre-flight чек: false → submit отменён (не валидно). */
  canSubmit: () => boolean
}

interface ServerErrorBag {
  errors?: unknown
  message?: unknown
  error?: unknown
}

const extractServerErrors = (error: unknown): { messages?: string[]; single?: string } => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object') {
      const bag = data as ServerErrorBag
      if (Array.isArray(bag.errors)) {
        return { messages: bag.errors.map(e => String(e)) }
      }
      if (typeof bag.message === 'string') return { single: bag.message }
      if (typeof bag.error === 'string') return { single: bag.error }
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
  const r = result as Record<string, unknown>
  const errs = r.errors ?? (typeof r.message === 'string' ? [r.message] : [])
  return Array.isArray(errs) ? errs.map(String) : [String(errs)]
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
}: UseAddShiftFormSubmissionOptions) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
  const [updateShiftMutation] = useUpdateShiftMutation()

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
        location: state.location,
        requirements: state.requirements,
        shift_type: state.shiftType,
        urgent: state.urgent,
        position: state.position,
        specializations: state.specializations.length > 0 ? state.specializations : undefined,
      },
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
        showToast?.(t('shift.updated'), 'success')
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
          showToast?.(t('shift.created'), 'success')
        } catch (error: unknown) {
          const { messages, single } = extractServerErrors(error)
          if (messages) {
            const { message } = applyServerErrors(messages)
            if (message) showToast?.(message, 'error')
            else triggerHapticFeedback('warning')
            return false
          }
          const errorMessage = translateServerError(single || t('shift.createError'), t)
          state.setSubmitError(errorMessage)
          showToast?.(errorMessage, 'error')
          return false
        }
      }

      onSave?.(response ?? null)
      state.resetForm()
      return true
    } catch (error: unknown) {
      const { messages, single } = extractServerErrors(error)
      if (messages) {
        const { message } = applyServerErrors(messages)
        if (message) showToast?.(message, 'error')
        else triggerHapticFeedback('warning')
        return false
      }
      const errorMessage = translateServerError(single || t('shift.updateError'), t)
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
  ])

  return { handleSave, isCreating }
}

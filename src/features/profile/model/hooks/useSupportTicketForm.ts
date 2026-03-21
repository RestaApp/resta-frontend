import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateSupportTicketMutation,
  type SupportTicketCategory,
  SUPPORT_TICKET_CATEGORIES,
} from '@/services/api/supportTicketsApi'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import type { SelectOption } from '@/components/ui/select'

const MAX_MESSAGE_LENGTH = 2000

const CATEGORY_EMOJI: Record<SupportTicketCategory, string> = {
  technical_issue: '🐛',
  account_issue: '😡',
  feature_request: '✨',
  general_inquiry: '❓',
  onboarding_issue: '🔐',
}

export function useSupportTicketForm(onClose: () => void) {
  const { t } = useTranslation()
  const [createTicket, { isLoading, isSuccess, error, reset }] = useCreateSupportTicketMutation()

  const [subject, setSubjectState] = useState('')
  const [message, setMessageState] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; message?: string }>({})

  const setSubject = useCallback((v: string) => {
    setSubjectState(v)
    setFieldErrors(prev => (prev.subject ? { ...prev, subject: undefined } : prev))
  }, [])

  const setMessage = useCallback((v: string) => {
    setMessageState(v)
    setFieldErrors(prev => (prev.message ? { ...prev, message: undefined } : prev))
  }, [])
  const [category, setCategory] = useState<SupportTicketCategory>('general_inquiry')
  const [contactInfo, setContactInfo] = useState('')

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      SUPPORT_TICKET_CATEGORIES.map(value => ({
        value,
        label: `${CATEGORY_EMOJI[value]} ${t(`profile.supportForm.category.${value}`)}`,
      })),
    [t]
  )

  const resetForm = useCallback(() => {
    setSubjectState('')
    setMessageState('')
    setCategory('general_inquiry')
    setContactInfo('')
    setFieldErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    reset()
    onClose()
  }, [onClose, resetForm, reset])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const requiredMsg = t('validation.requiredField')
      const nextErrors: { subject?: string; message?: string } = {}
      if (!subject.trim()) nextErrors.subject = requiredMsg
      if (!message.trim()) nextErrors.message = requiredMsg
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors)
        return
      }
      setFieldErrors({})

      try {
        await createTicket({
          support_ticket: {
            subject: subject.trim(),
            initial_message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
            category,
            ...(contactInfo.trim() && { contact_info: contactInfo.trim() }),
          },
        }).unwrap()
      } catch {
        // ошибка попадёт в error из мутации
      }
    },
    [createTicket, subject, message, category, contactInfo, t]
  )

  const errorMessage = getErrorMessage(error)

  return {
    subject,
    setSubject,
    message,
    setMessage,
    category,
    setCategory,
    contactInfo,
    setContactInfo,
    categoryOptions,
    handleClose,
    handleSubmit,
    isLoading,
    isSuccess,
    errorMessage,
    fieldErrors,
    maxMessageLength: MAX_MESSAGE_LENGTH,
  }
}

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { HelpCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { ModalContent } from '@/components/ui/modal-content'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Select, type SelectOption } from '@/components/ui/select'
import {
  useCreateSupportTicketMutation,
  type SupportTicketCategory,
  SUPPORT_TICKET_CATEGORIES,
} from '@/services/api/supportTicketsApi'
import type { ApiErrorResponse } from '@/services/api/supportTicketsApi'

const MAX_MESSAGE_LENGTH = 2000

const TEXTAREA_CLASS =
  'w-full min-h-[120px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none'

interface SupportFormModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_EMOJI: Record<SupportTicketCategory, string> = {
  technical_issue: '🐛',
  account_issue: '😡',
  feature_request: '✨',
  general_inquiry: '❓',
  onboarding_issue: '🔐',
}

export const SupportFormModal = memo(function SupportFormModal({
  isOpen,
  onClose,
}: SupportFormModalProps) {
  const { t } = useTranslation()
  const [createTicket, { isLoading, isSuccess, error, reset }] =
    useCreateSupportTicketMutation()

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<SupportTicketCategory>('general_inquiry')
  const [contactInfo, setContactInfo] = useState('')

  const categoryOptions: SelectOption[] = SUPPORT_TICKET_CATEGORIES.map(
    (value) => ({
      value,
      label: `${CATEGORY_EMOJI[value]} ${t(`profile.supportForm.category.${value}`)}`,
    })
  )

  const resetForm = useCallback(() => {
    setSubject('')
    setMessage('')
    setCategory('general_inquiry')
    setContactInfo('')
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    reset()
    onClose()
  }, [onClose, resetForm, reset])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!subject.trim() || !message.trim()) return

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
        // Ошибка в error из useCreateSupportTicketMutation
      }
    },
    [createTicket, subject, message, category, contactInfo]
  )

  const apiErrors =
    error && 'data' in error
      ? (error.data as ApiErrorResponse | undefined)?.errors
      : null
  const errorMessage = apiErrors?.length
    ? apiErrors[0]
    : error && 'data' in error
      ? (error.data as { message?: string })?.message
      : null

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalContent
          icon={<HelpCircle className="h-10 w-10" style={{ color: 'var(--purple-deep)' }} />}
          title={t('profile.supportForm.successTitle')}
          description={t('profile.supportForm.successDescription')}
          primaryButton={{
            label: t('common.understand'),
            onClick: handleClose,
          }}
        />
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
            <HelpCircle className="h-6 w-6" style={{ color: 'var(--purple-deep)' }} />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {t('profile.supportForm.title')}
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('profile.supportForm.description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('profile.supportForm.subject')} *
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('profile.supportForm.subjectPlaceholder')}
              required
              maxLength={200}
              data-autofocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('profile.supportForm.categoryLabel')} *
            </label>
            <Select
              value={category}
              onChange={(v) => setCategory(v as SupportTicketCategory)}
              options={categoryOptions}
              label={undefined}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('profile.supportForm.message')} *
            </label>
            <textarea
              className={TEXTAREA_CLASS}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('profile.supportForm.messagePlaceholder')}
              required
              maxLength={MAX_MESSAGE_LENGTH}
              rows={4}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t('profile.supportForm.contactInfo')}
            </label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={t('profile.supportForm.contactInfoPlaceholder')}
              type="tel"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <div className="flex gap-3 pt-2">
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
              <Button
                type="submit"
                variant="primary"
                className="w-full rounded-xl"
                disabled={isLoading || !subject.trim() || !message.trim()}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" />
                    {t('common.saving')}
                  </span>
                ) : (
                  t('profile.supportForm.submit')
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </Modal>
  )
})

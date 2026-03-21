import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import type { SupportTicketCategory } from '@/services/api/supportTicketsApi'
import type { SelectOption } from '@/components/ui/select'

interface SupportTicketFormProps {
  subject: string
  setSubject: (v: string) => void
  message: string
  setMessage: (v: string) => void
  category: SupportTicketCategory
  setCategory: (v: SupportTicketCategory) => void
  contactInfo: string
  setContactInfo: (v: string) => void
  categoryOptions: SelectOption[]
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isLoading: boolean
  errorMessage: string | null
  maxMessageLength: number
}

export function SupportTicketForm({
  subject,
  setSubject,
  message,
  setMessage,
  category,
  setCategory,
  contactInfo,
  setContactInfo,
  categoryOptions,
  onSubmit,
  onCancel,
  isLoading,
  errorMessage,
  maxMessageLength,
}: SupportTicketFormProps) {
  const { t } = useTranslation()

  return (
    <form onSubmit={onSubmit} className="ui-density-stack">
      <FormField label={t('profile.supportForm.subject')} required>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder={t('profile.supportForm.subjectPlaceholder')}
          required
          maxLength={200}
          data-autofocus
        />
      </FormField>

      <FormField label={t('profile.supportForm.categoryLabel')} required>
        <Select
          value={category}
          onChange={v => setCategory(v as SupportTicketCategory)}
          options={categoryOptions}
        />
      </FormField>

      <FormField
        label={t('profile.supportForm.message')}
        required
        hint={`${message.length}/${maxMessageLength}`}
      >
        <Textarea
          className="min-h-[120px] resize-none"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t('profile.supportForm.messagePlaceholder')}
          required
          maxLength={maxMessageLength}
          rows={4}
        />
      </FormField>

      <FormField label={t('profile.supportForm.contactInfo')}>
        <Input
          value={contactInfo}
          onChange={e => setContactInfo(e.target.value)}
          placeholder={t('profile.supportForm.contactInfoPlaceholder')}
          type="text"
        />
      </FormField>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex gap-3 pt-2">
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            type="submit"
            variant="gradient"
            size="md"
            className="w-full"
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
  )
}

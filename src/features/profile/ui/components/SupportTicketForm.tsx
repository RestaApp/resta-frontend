import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Select } from '@/components/ui/select'
import type { SupportTicketCategory } from '@/services/api/supportTicketsApi'
import type { SelectOption } from '@/components/ui/select'

const TEXTAREA_CLASS =
  'w-full min-h-[120px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background text-foreground caret-foreground transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none'

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('profile.supportForm.subject')} *
        </label>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value)}
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
          onChange={v => setCategory(v as SupportTicketCategory)}
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
          onChange={e => setMessage(e.target.value)}
          placeholder={t('profile.supportForm.messagePlaceholder')}
          required
          maxLength={maxMessageLength}
          rows={4}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {message.length}/{maxMessageLength}
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          {t('profile.supportForm.contactInfo')}
        </label>
        <Input
          value={contactInfo}
          onChange={e => setContactInfo(e.target.value)}
          placeholder={t('profile.supportForm.contactInfoPlaceholder')}
          type="text"
        />
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex gap-3 pt-2">
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
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
  )
}

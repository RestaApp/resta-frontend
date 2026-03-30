import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { MODAL_SURFACE_CLASS } from '@/components/ui/ui-patterns'

interface ApplyCoverLetterModalProps {
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (message?: string) => Promise<void>
}

export function ApplyCoverLetterModal({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: ApplyCoverLetterModalProps) {
  if (!open) return null
  return (
    <ApplyCoverLetterModalContent
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

interface ApplyCoverLetterModalContentProps {
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (message?: string) => Promise<void>
}

function ApplyCoverLetterModalContent({
  isSubmitting,
  onClose,
  onSubmit,
}: ApplyCoverLetterModalContentProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')

  const example = useMemo(() => t('shift.coverMessageExample'), [t])

  const handleUseExample = () => {
    setMessage(example)
  }

  const handleSubmit = async () => {
    await onSubmit(message.trim() || undefined)
  }

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg">
      <div className={`${MODAL_SURFACE_CLASS} p-4`}>
        <h2 className="text-lg font-semibold text-foreground">
          {t('shift.coverMessagePromptTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('shift.coverMessagePromptDescription')}
        </p>

        <div className="mt-4 space-y-3">
          <FormField
            label={t('shift.coverMessage')}
            hint={t('shift.coverMessageHint')}
            htmlFor="apply-cover-message"
          >
            <Textarea
              id="apply-cover-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('shift.coverMessagePlaceholder')}
              className="min-h-[110px] resize-y"
              maxLength={2000}
            />
          </FormField>

          <button
            type="button"
            onClick={handleUseExample}
            className="text-xs text-primary hover:underline"
          >
            {t('shift.useCoverMessageExample')}
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
            className="flex-1"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="md"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('shift.sending') : t('shift.apply')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

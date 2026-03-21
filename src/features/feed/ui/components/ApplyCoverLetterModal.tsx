import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'

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
  const { t } = useTranslation()
  const [message, setMessage] = useState('')

  const example = useMemo(
    () =>
      t(
        'shift.coverMessageExample',
        'Здравствуйте! Имею релевантный опыт на этой позиции, готов(а) выйти в указанное время и быстро включиться в работу.'
      ),
    [t]
  )

  useEffect(() => {
    if (!open) setMessage('')
  }, [open])

  const handleUseExample = () => {
    setMessage(example)
  }

  const handleSubmit = async () => {
    await onSubmit(message.trim() || undefined)
  }

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-lg">
      <div className="w-full rounded-3xl border border-border bg-card p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-foreground">
          {t('shift.coverMessagePromptTitle', 'Сопроводительное письмо')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            'shift.coverMessagePromptDescription',
            'При отклике можно добавить короткое сообщение работодателю.'
          )}
        </p>

        <div className="mt-4 space-y-3">
          <FormField
            label={t('shift.coverMessage')}
            hint={t('shift.coverMessageHint', 'Необязательно, но повышает шанс ответа')}
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
            {t('shift.useCoverMessageExample', 'Вставить пример')}
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={onClose} variant="outline" size="md" className="flex-1" disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="gradient" size="md" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? t('shift.sending') : t('shift.apply')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

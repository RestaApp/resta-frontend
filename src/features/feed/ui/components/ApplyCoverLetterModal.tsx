import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { MODAL_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { formatMoney } from '@/features/feed/model/utils/formatting'
import type { Shift } from '@/features/feed/model/types'
import type { UserData } from '@/services/api/authApi'

interface ApplyCoverLetterModalProps {
  open: boolean
  isSubmitting: boolean
  shift: Shift | null
  userProfile: UserData | null
  onClose: () => void
  onSubmit: (message?: string) => Promise<void>
}

export function ApplyCoverLetterModal({
  open,
  isSubmitting,
  shift,
  userProfile,
  onClose,
  onSubmit,
}: ApplyCoverLetterModalProps) {
  if (!open) return null
  return (
    <ApplyCoverLetterModalContent
      isSubmitting={isSubmitting}
      shift={shift}
      userProfile={userProfile}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

interface ApplyCoverLetterModalContentProps {
  isSubmitting: boolean
  shift: Shift | null
  userProfile: UserData | null
  onClose: () => void
  onSubmit: (message?: string) => Promise<void>
}

function ApplyCoverLetterModalContent({
  isSubmitting,
  shift,
  onClose,
  onSubmit,
}: ApplyCoverLetterModalContentProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')

  const shiftSummary = useMemo(() => {
    const parts = [
      shift?.restaurant,
      shift?.pay ? `${formatMoney(Number(shift.pay))} ${shift.currency}` : null,
      shift?.date,
      shift?.time,
    ].filter(Boolean)
    return parts.join(' · ')
  }, [shift])

  const handleSubmit = async () => {
    await onSubmit(message.trim() || undefined)
  }

  return (
    <Drawer open onOpenChange={open => !open && onClose()} overlayClassName="bg-black/60">
      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-5">
        <h2 className={MODAL_TITLE_CLASS}>
          {t('shift.applyNow', { defaultValue: 'Откликнуться' })}
        </h2>
        {shiftSummary ? (
          <p className="mt-2 text-sm leading-snug text-muted-foreground">{shiftSummary}</p>
        ) : null}

        <label
          htmlFor="apply-cover-message"
          className="mt-6 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {t('shift.coverMessageOptional', { defaultValue: 'Сообщение (опц.)' })}
        </label>
        <Textarea
          id="apply-cover-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t('shift.coverMessagePlaceholderShort', {
            defaultValue: 'Готова выйти к 15:45, опыт работы с грилем — да.',
          })}
          className={cn(
            'mt-2 min-h-20 resize-none rounded-lg border-border bg-input-background p-3',
            'text-sm leading-snug text-foreground placeholder:text-muted-foreground'
          )}
          maxLength={2000}
        />

        <div className="mt-5 flex gap-3 rounded-lg border border-success/50 bg-success/10 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success text-base font-bold text-white">
            i
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-success">
              {t('shift.applyPrivacyTitle', { defaultValue: 'Сообщение увидит менеджер' })}
            </p>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              {t('shift.applyPrivacyDescription', {
                defaultValue: 'Контакты откроются после принятия отклика.',
              })}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          variant="gradient"
          size="lg"
          className="mt-5 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('shift.sending')
            : t('shift.sendApplication', { defaultValue: 'Отправить отклик' })}
        </Button>
      </div>
    </Drawer>
  )
}

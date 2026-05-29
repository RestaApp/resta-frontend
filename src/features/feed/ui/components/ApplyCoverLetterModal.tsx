import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { SHIFT_CARD_LOGO_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { formatMoney } from '@/shared/shifts/formatting'
import type { Shift } from '@/shared/shifts/types'

interface ApplyCoverLetterModalProps {
  open: boolean
  isSubmitting: boolean
  shift: Shift | null
  onClose: () => void
  onSubmit: (message?: string) => Promise<void>
}

export function ApplyCoverLetterModal({
  open,
  isSubmitting,
  shift,
  onClose,
  onSubmit,
}: ApplyCoverLetterModalProps) {
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

  if (!open) return null

  return (
    <Drawer open onOpenChange={openState => !openState && onClose()} overlayClassName="bg-black/50">
      <DrawerHeader>
        <DrawerTitle>{t('shift.applyNow', { defaultValue: 'Откликнуться' })}</DrawerTitle>
        {shiftSummary ? <DrawerDescription>{shiftSummary}</DrawerDescription> : null}
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="apply-cover-message" className={PROFILE_SECTION_LABEL_CLASS}>
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
              'min-h-20 resize-none rounded-lg border-border bg-input-background p-3',
              'text-sm leading-snug text-foreground placeholder:text-muted-foreground'
            )}
            maxLength={2000}
          />
        </div>

        <div className="flex gap-2 rounded-lg border border-success/50 bg-success/10 p-3">
          <div className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-success text-white')}>i</div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-tight text-success">
              {t('shift.applyPrivacyTitle', { defaultValue: 'Сообщение увидит менеджер' })}
            </p>
            <p className="text-sm leading-snug text-muted-foreground">
              {t('shift.applyPrivacyDescription', {
                defaultValue: 'Контакты откроются после принятия отклика.',
              })}
            </p>
          </div>
        </div>
      </DrawerBody>

      <DrawerFooter>
        <Button
          onClick={handleSubmit}
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('shift.sending')
            : t('shift.sendApplication', { defaultValue: 'Отправить отклик' })}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

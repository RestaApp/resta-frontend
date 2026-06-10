import { useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerDescription,
  DrawerFooter,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { SHIFT_CARD_LOGO_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { Textarea } from '@/components/ui/textarea'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '@/shared/shifts/formatting'
import type { Shift } from '@/shared/shifts/types'
import { cn } from '@/shared/utils/cn'

type CoverMessagePreset = 'ready' | 'experience' | 'similar' | 'custom'

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
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const [selectedPreset, setSelectedPreset] = useState<CoverMessagePreset | null>(null)
  const [customMessage, setCustomMessage] = useState('')

  const positionText = useMemo(() => {
    if (!shift) return ''
    const position = getEmployeePositionLabel(shift.position)
    const specialization = shift.specialization
      ? ` • ${getSpecializationLabel(shift.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [shift, getEmployeePositionLabel, getSpecializationLabel])

  const shiftPrimaryLine = useMemo(() => {
    if (!shift) return ''
    const pay = shift.pay ? `${formatMoney(Number(shift.pay))} ${shift.currency}` : null
    return [positionText, pay].filter(Boolean).join(' • ')
  }, [shift, positionText])

  const shiftSecondaryLine = useMemo(() => {
    if (!shift) return ''
    return [shift.date, shift.time].filter(Boolean).join(' • ')
  }, [shift])

  const presetMessages = useMemo(
    () => ({
      ready: t('shift.coverMessagePresetReady'),
      experience: t('shift.coverMessagePresetExperience', { position: positionText }),
      similar: t('shift.coverMessagePresetSimilar'),
    }),
    [t, positionText]
  )

  const presetOptions = useMemo(
    () =>
      [
        { id: 'ready' as const, label: presetMessages.ready },
        { id: 'experience' as const, label: presetMessages.experience },
        { id: 'similar' as const, label: presetMessages.similar },
        {
          id: 'custom' as const,
          label: t('shift.coverMessagePresetCustom'),
          icon: Pencil,
        },
      ] satisfies Array<{
        id: CoverMessagePreset
        label: string
        icon?: typeof Pencil
      }>,
    [presetMessages, t]
  )

  const resolveMessage = (): string | undefined => {
    if (!selectedPreset) return undefined
    if (selectedPreset === 'custom') return customMessage.trim() || undefined
    return presetMessages[selectedPreset]
  }

  const handleSubmit = async () => {
    await onSubmit(resolveMessage())
  }

  if (!open) return null

  return (
    <Drawer open onOpenChange={openState => !openState && onClose()} overlayClassName="bg-black/50">
      <DrawerFrame className="flex-1">
        <DrawerHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1">
              <DrawerTitle>{t('shift.applyNow')}</DrawerTitle>
              {shiftPrimaryLine ? (
                <DrawerDescription className="text-foreground/80">
                  {shiftPrimaryLine}
                </DrawerDescription>
              ) : null}
              {shiftSecondaryLine ? (
                <DrawerDescription>{shiftSecondaryLine}</DrawerDescription>
              ) : null}
            </div>
            <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
          </div>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold leading-snug text-foreground">
              {t('shift.coverMessageToManager')}{' '}
              <span className="font-normal text-muted-foreground">
                ({t('shift.coverMessageOptionalSuffix')})
              </span>
            </p>

            <div className="flex flex-col items-start gap-2">
              {presetOptions.map(option => {
                const Icon = option.icon
                const isSelected = selectedPreset === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedPreset(option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'inline-flex max-w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-elevated'
                    )}
                  >
                    <span className="min-w-0">{option.label}</span>
                    {Icon ? <Icon className={cn(ICON_SM_CLASS, 'shrink-0')} aria-hidden /> : null}
                  </button>
                )
              })}
            </div>

            {selectedPreset === 'custom' ? (
              <Textarea
                id="apply-cover-message"
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder={t('shift.coverMessagePlaceholderShort')}
                className={cn(
                  'min-h-20 resize-none rounded-lg border-border bg-input-background p-3',
                  'text-sm leading-snug text-foreground placeholder:text-muted-foreground'
                )}
                maxLength={2000}
                autoFocus
              />
            ) : null}
          </div>

          <div className="flex gap-2 rounded-lg bg-success/10 p-3">
            <div className={cn(SHIFT_CARD_LOGO_CLASS, 'h-8 w-8 bg-success text-sm text-white')}>
              i
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold leading-tight text-success">
                {t('shift.applyPrivacyTitle')}
              </p>
              <p className="text-sm leading-snug text-muted-foreground">
                {t('shift.applyPrivacyDescription')}
              </p>
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="md"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('shift.sending') : t('shift.sendApplication')}
          </Button>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
}

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ResultOverlay } from '@/components/ui/result-overlay'
import { BODY_TEXT_CLASS } from '@/components/ui/ui-patterns'
import { REGISTRATION_COMPLETE_CONTENT } from '@/features/role-selector/model/registrationCompleteContent'
import { getRoleCategory, type UiRole } from '@/shared/types/roles.types'
import { cn } from '@/shared/utils/cn'

interface RegistrationCompleteOverlayProps {
  role: UiRole
  open: boolean
  onContinue: () => void
}

const CONFETTI_DOTS = [
  { className: 'left-2 top-1 h-1.5 w-1.5 rounded-full bg-primary/80' },
  { className: 'right-1 top-3 h-2 w-2 rounded-full bg-success/70' },
  { className: '-left-1 bottom-2 h-1.5 w-1.5 rounded-full bg-primary/60' },
  { className: 'right-0 bottom-0 h-1 w-1 rounded-full bg-foreground/40' },
] as const

const SuccessIcon = memo(function SuccessIcon() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center" aria-hidden>
      {CONFETTI_DOTS.map(dot => (
        <span key={dot.className} className={cn('absolute', dot.className)} />
      ))}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-white shadow-[var(--shadow-success-cta)]">
        <Check className="h-8 w-8" strokeWidth={2.5} />
      </div>
    </div>
  )
})

export const RegistrationCompleteOverlay = memo(function RegistrationCompleteOverlay({
  role,
  open,
  onContinue,
}: RegistrationCompleteOverlayProps) {
  const { t } = useTranslation()
  const category = getRoleCategory(role)
  const content = REGISTRATION_COMPLETE_CONTENT[category]

  return (
    <ResultOverlay
      open={open}
      tone="success"
      title={t('onboarding.complete.title')}
      description={t(content.subtitleKey)}
      onClose={onContinue}
      iconSlot={<SuccessIcon />}
      primaryAction={{
        label: t(content.ctaKey),
        onClick: onContinue,
        variant: 'gradient',
      }}
    >
      <div className="flex w-full flex-col gap-2">
        {content.features.map(feature => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.textKey}
              padding="md"
              className="flex items-center gap-3 border-border/60 bg-secondary/70 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <p className={cn(BODY_TEXT_CLASS, 'min-w-0 leading-snug')}>{t(feature.textKey)}</p>
            </Card>
          )
        })}
      </div>
    </ResultOverlay>
  )
})

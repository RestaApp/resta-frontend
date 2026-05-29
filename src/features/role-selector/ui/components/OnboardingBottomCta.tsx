import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { SHADOW_MODAL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'

export const ONBOARDING_BOTTOM_CTA_SPACE = 'pb-onboarding-cta'

export const ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT = 'pb-onboarding-cta-with-hint'

interface OnboardingBottomCtaProps {
  children: ReactNode
  onClick: () => void
  ariaLabel?: string
  disabled?: boolean
  loading?: boolean
  showFillLaterHint?: boolean
  className?: string
}

export const OnboardingBottomCta = memo(function OnboardingBottomCta({
  children,
  onClick,
  ariaLabel,
  disabled = false,
  loading = false,
  showFillLaterHint = false,
  className,
}: OnboardingBottomCtaProps) {
  const { t } = useTranslation()

  return (
    <BottomActionBar mode="fixed" withBorder transparent={false}>
      <Button
        type="button"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        variant="gradient"
        size="md"
        className={cn('w-full', SHADOW_MODAL_CLASS, 'disabled:opacity-40', className)}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
      {showFillLaterHint ? (
        <p className="mt-3 text-center text-xs text-muted-foreground opacity-70">
          {t('profile.fillLaterHint')}
        </p>
      ) : null}
    </BottomActionBar>
  )
})

import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SHADOW_MODAL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'

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
    <div
      className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 ui-density-page pt-3 pb-safe-cta backdrop-blur-sm"
      style={{ zIndex: Z_INDEX.stickyHeader }}
    >
      <div className="mx-auto w-full max-w-md">
        <Button
          type="button"
          onClick={onClick}
          loading={loading}
          disabled={disabled}
          variant="gradient"
          size="lg"
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
      </div>
    </div>
  )
})

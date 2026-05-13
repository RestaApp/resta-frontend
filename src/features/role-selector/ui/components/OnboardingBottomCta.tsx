import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { RoleKind } from '@/shared/lib/role-theme'

export const ONBOARDING_BOTTOM_CTA_SPACE = 'pb-onboarding-cta'

export const ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT = 'pb-onboarding-cta-with-hint'

const TONE_CTA: Record<RoleKind | 'primary', string> = {
  primary: '',
  employee: 'bg-role-employee hover:bg-role-employee/90 active:bg-role-employee/80',
  restaurant: 'bg-role-restaurant hover:bg-role-restaurant/90 active:bg-role-restaurant/80',
  supplier: 'bg-role-supplier hover:bg-role-supplier/90 active:bg-role-supplier/80',
}

interface OnboardingBottomCtaProps {
  children: ReactNode
  onClick: () => void
  ariaLabel?: string
  disabled?: boolean
  loading?: boolean
  tone?: RoleKind | 'primary'
  showFillLaterHint?: boolean
  className?: string
}

export const OnboardingBottomCta = memo(function OnboardingBottomCta({
  children,
  onClick,
  ariaLabel,
  disabled = false,
  loading = false,
  tone = 'primary',
  showFillLaterHint = false,
  className,
}: OnboardingBottomCtaProps) {
  const { t } = useTranslation()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-4 pt-3 pb-safe-cta backdrop-blur-sm"
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
          className={cn(
            'w-full shadow-[0_14px_40px_rgba(0,0,0,0.4)] disabled:opacity-40',
            TONE_CTA[tone],
            className
          )}
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

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'

interface LegalConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onPrivacyPress?: () => void
  onTermsPress?: () => void
  error?: boolean
  className?: string
}

export const LegalConsentCheckbox = memo(function LegalConsentCheckbox({
  checked,
  onChange,
  onPrivacyPress,
  onTermsPress,
  error,
  className,
}: LegalConsentCheckboxProps) {
  const { t } = useTranslation()

  const handleToggle = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="flex items-start gap-3 cursor-pointer">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={handleToggle}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
            checked
              ? 'border-primary bg-primary text-white'
              : error
                ? 'border-destructive bg-destructive/10'
                : 'border-border bg-input-background'
          )}
        >
          {checked ? (
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          ) : null}
        </button>
        <span className="text-xs leading-snug text-muted-foreground">
          {t('legal.consent.prefix')}{' '}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onPrivacyPress?.()
            }}
            className="text-primary underline underline-offset-2"
          >
            {t('legal.consent.privacyLink')}
          </button>{' '}
          {t('legal.consent.and')}{' '}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onTermsPress?.()
            }}
            className="text-primary underline underline-offset-2"
          >
            {t('legal.consent.termsLink')}
          </button>
          {t('legal.consent.suffix')}
        </span>
      </label>
      {error ? (
        <p className="pl-8 text-xs text-destructive">{t('legal.consent.required')}</p>
      ) : null}
    </div>
  )
})

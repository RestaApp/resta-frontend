import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'

interface OnboardingCompleteScreenProps {
  onComplete: () => void
}

export const OnboardingCompleteScreen = memo(function OnboardingCompleteScreen({
  onComplete,
}: OnboardingCompleteScreenProps) {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)

  const displayName =
    user?.full_name?.trim() || user?.name?.trim() || t('onboarding.telegram.fallbackName')
  const displayUsername = user?.username?.trim()
    ? `@${user.username.trim().replace(/^@/, '')}`
    : t('onboarding.telegram.noUsername')
  const displayPhone = user?.phone?.trim() || t('onboarding.telegram.phonePlaceholder')
  const displayCity =
    user?.city?.trim() || user?.location?.trim() || t('onboarding.telegram.cityFallback')

  return (
    <div className="bg-background min-h-[100dvh] flex flex-col ui-density-page ui-density-py pt-[14px]">
      <div
        className="h-[3px] w-full rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={2}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={t('onboarding.stepOf', { current: 2, total: 3 })}
      >
        <div className="h-full w-2/3 rounded-full bg-primary transition-all duration-300" />
      </div>
      <p className="mt-2 font-mono-resta text-[11px] uppercase tracking-widest text-muted-foreground">
        {t('onboarding.stepOf', { current: 2, total: 3 })}
      </p>

      <div className="mt-4">
        <h1 className="text-[34px] leading-[1.05] tracking-[-0.025em] font-bold text-foreground">
          {t('onboarding.telegram.title')}
        </h1>
        <p className="mt-2 max-w-[320px] text-sm leading-[1.4] text-[#7B7570]">
          {t('onboarding.telegram.subtitle')}
        </p>
      </div>

      <div className="mt-5 rounded-[18px] border border-border bg-[#141310] p-4 text-center">
        <div className="mx-auto mb-3 h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[#0088CC] to-[#005C8C]">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={displayName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="text-sm font-semibold text-foreground">{displayName}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{displayUsername}</div>
        <div className="mt-2 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-[#3EC97E]">
          {t('onboarding.telegram.connected')}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {t('onboarding.telegram.phoneLabel')}
        </div>
        <div className="flex items-center justify-between rounded-[12px] border border-border bg-input-background px-3 py-3 text-sm">
          <span className="text-foreground">{displayPhone}</span>
          <span className="font-mono-resta text-[11px] uppercase tracking-[0.08em] text-primary">
            {t('onboarding.telegram.share')}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-2 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {t('onboarding.telegram.cityLabel')}
        </div>
        <div className="flex items-center justify-between rounded-[12px] border border-border bg-input-background px-3 py-3 text-sm">
          <span className="text-foreground">{displayCity}</span>
          <span className="font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('onboarding.telegram.cityHint')}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-[12px] border border-[#3EC97E4D] bg-[#3EC97E0F] p-3">
        <p className="text-[11px] leading-[1.45] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {t('onboarding.telegram.shieldTitle')}
          </span>{' '}
          {t('onboarding.telegram.shieldText')}
        </p>
      </div>

      <div className="mt-auto pb-[calc(14px+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] pt-4">
        <button
          type="button"
          onClick={onComplete}
          className="w-full rounded-[14px] border-none bg-primary px-4 py-[18px] text-base font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  )
})

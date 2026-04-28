import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { LocationField } from './subroles/shared/LocationField'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui'
import { OnboardingProgress } from './OnboardingProgress'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useTelegramConfirmStep } from '../../model/useTelegramConfirmStep'
import { formatPhoneInput } from '@/utils/phone'

interface TelegramConfirmStepProps {
  onContinue: () => void
  onBack: () => void
}

export const TelegramConfirmStep = memo(function TelegramConfirmStep({
  onContinue,
  onBack,
}: TelegramConfirmStepProps) {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)
  const {
    displayName,
    displayUsername,
    manualPhone,
    selectedCity,
    phoneError,
    cityError,
    isPhoneFilled,
    isRequestingPhone,
    isRequestingLocation,
    isSaving,
    handlePhoneShare,
    handleLocationShare,
    handleContinue,
    setManualPhone,
    setSelectedCity,
    setPhoneError,
    setCityError,
  } = useTelegramConfirmStep({ onContinue, onBack })

  return (
    <div className="bg-background min-h-[100dvh] flex flex-col">
      <div className="flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] overflow-y-auto pb-[calc(6.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]">
        <OnboardingProgress current={2} total={3} className="mb-[14px]" />
        <SectionHeader
          title={t('onboarding.telegram.title')}
          description={t('onboarding.telegram.subtitle')}
          className="mb-4"
        />

        <div className="rounded-[16px] border border-border bg-[#141310] p-4 text-center">
          <div className="mx-auto mb-3 h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[#0088CC] to-[#005C8C]">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={displayName} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="text-sm font-semibold text-foreground">{displayName}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{displayUsername}</div>
          <div className="mt-2.5 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-[#3EC97E]">
            {t('onboarding.telegram.connected')}
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-2 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('onboarding.telegram.phoneRequiredLabel')}
          </div>
          <div className="flex h-11 items-center gap-2 rounded-[12px] border border-border bg-input-background px-3 text-sm">
            <Input
              value={manualPhone}
              onChange={e => {
                setManualPhone(formatPhoneInput(e.target.value))
                setPhoneError(null)
              }}
              placeholder={t('phone.placeholderExample')}
              className="!border-0 !ring-0 !shadow-none bg-transparent px-0 py-0 text-sm focus-visible:!ring-0 focus-visible:!border-0 focus-visible:!shadow-none"
            />
            <button
              type="button"
              onClick={handlePhoneShare}
              className="whitespace-nowrap font-mono-resta text-[11px] uppercase tracking-[0.08em] leading-none text-primary disabled:opacity-60"
              disabled={isRequestingPhone}
            >
              {isPhoneFilled ? t('onboarding.telegram.shared') : t('onboarding.telegram.share')}
            </button>
          </div>
          {phoneError ? <p className="mt-1 text-xs text-destructive">{phoneError}</p> : null}
        </div>

        <div className="mt-3">
          <div className="mb-2 font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('onboarding.telegram.cityLabel')}
          </div>
          <div className="w-full">
            <LocationField
              value={selectedCity}
              onChange={value => {
                setSelectedCity(value)
                setCityError(null)
              }}
              onLocationRequest={handleLocationShare}
              isLoading={isRequestingLocation}
              hideLabel
            />
          </div>
          {cityError ? <p className="mt-1 text-xs text-destructive">{cityError}</p> : null}
        </div>

        <div className="mt-[14px] rounded-[12px] border border-[#3EC97E4D] bg-[#3EC97E0F] px-3 py-2.5">
          <p className="text-[11px] leading-[1.45] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t('onboarding.telegram.shieldTitle')}
            </span>{' '}
            {t('onboarding.telegram.shieldText')}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-4 pt-3 pb-[calc(1.25rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] backdrop-blur-sm">
        <Button
          type="button"
          onClick={handleContinue}
          loading={isSaving}
          disabled={isSaving}
          variant="gradient"
          size="lg"
          className="mx-auto w-full max-w-md"
        >
          {t('onboarding.telegram.next')}
        </Button>
      </div>
    </div>
  )
})

import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LocationField } from './subroles/shared/LocationField'
import { Card } from '@/components/ui'
import { OnboardingSection, OnboardingStepLayout } from './OnboardingStepLayout'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useTelegramConfirmStep } from '../../model/useTelegramConfirmStep'
import { formatPhoneInput } from '@/utils/phone'
import type { UiRole } from '@/shared/types/roles.types'
import { getRoleCategory, type RoleCategory } from '@/shared/types/roles.types'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE } from './OnboardingBottomCta'

const ROLE_SHIELD_ICON: Record<RoleCategory, string> = {
  employee: '🛡',
  restaurant: '⚡',
  supplier: '⭐',
}

interface TelegramConfirmStepProps {
  onContinue: () => void
  onBack: () => void
  selectedRole: UiRole | null
}

export const TelegramConfirmStep = memo(function TelegramConfirmStep({
  onContinue,
  onBack,
  selectedRole,
}: TelegramConfirmStepProps) {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)
  const copyRole =
    selectedRole === 'venue' || selectedRole === 'supplier' ? selectedRole : 'employee'
  const roleCategory = getRoleCategory(selectedRole ?? 'chef')
  const [isEditingName, setIsEditingName] = useState(false)
  const {
    displayName,
    editedName,
    setEditedName,
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
    <OnboardingStepLayout
      currentStep={2}
      totalSteps={3}
      title={t('onboarding.telegram.title')}
      subtitle={t(`onboarding.telegram.copy.${copyRole}.subtitle`)}
      bottomSpace={ONBOARDING_BOTTOM_CTA_SPACE}
    >
      <Card className="text-center">
        <div className="mx-auto mb-3 h-14 w-14 overflow-hidden rounded-xl bg-[image:var(--gradient-primary)]">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={displayName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        {isEditingName ? (
          <Input
            autoFocus
            value={editedName || displayName}
            onChange={e => setEditedName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') setIsEditingName(false)
            }}
            className={cn(BLOCK_TITLE_CLASS, 'mx-auto h-8 max-w-60 text-center')}
            aria-label={t('onboarding.telegram.editName', { defaultValue: 'Имя' })}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            className={cn(BLOCK_TITLE_CLASS, 'mx-auto inline-flex items-center gap-1')}
            aria-label={t('onboarding.telegram.editName', { defaultValue: 'Имя' })}
          >
            {displayName}
            <Pencil className="h-3 w-3 text-muted-foreground" aria-hidden />
          </button>
        )}
        <div className="mt-0.5 text-sm text-muted-foreground">{displayUsername}</div>
        <div className="mt-2.5 font-mono-resta text-xs uppercase tracking-widest text-success">
          {t('onboarding.telegram.connected')}
        </div>
      </Card>

      <OnboardingSection label={t('onboarding.telegram.phoneRequiredLabel')} className="mt-3">
        <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-input-background px-3 text-sm">
          <Input
            variant="inline"
            value={manualPhone}
            onChange={e => {
              setManualPhone(formatPhoneInput(e.target.value))
              setPhoneError(null)
            }}
            placeholder={t('phone.placeholderExample')}
          />
          <button
            type="button"
            onClick={handlePhoneShare}
            className="whitespace-nowrap text-sm font-semibold leading-none text-primary disabled:opacity-60"
            disabled={isRequestingPhone}
          >
            {isPhoneFilled ? t('onboarding.telegram.shared') : t('onboarding.telegram.share')}
          </button>
        </div>
        {phoneError ? <p className="mt-1 text-xs text-destructive">{phoneError}</p> : null}
      </OnboardingSection>

      <OnboardingSection label={t('onboarding.telegram.cityLabel')} className="mt-3">
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
      </OnboardingSection>

      <div role="note" className="mt-3 rounded-xl border border-primary bg-primary/10 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <span aria-hidden className="shrink-0 mt-0.5 text-sm text-primary">
            {ROLE_SHIELD_ICON[roleCategory]}
          </span>
          <div className="flex-1 text-xs leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t(`onboarding.telegram.copy.${copyRole}.shieldTitle`)}
            </span>{' '}
            {t(`onboarding.telegram.copy.${copyRole}.shieldText`)}
          </div>
        </div>
      </div>

      <OnboardingBottomCta onClick={handleContinue} loading={isSaving} disabled={isSaving}>
        {t('onboarding.telegram.next')}
      </OnboardingBottomCta>
    </OnboardingStepLayout>
  )
})

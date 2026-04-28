import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useUserUpdate } from '../../model/useUserUpdate'
import { useGeolocation, getCityByCoordinates } from '@/hooks/useGeolocation'
import { requestTelegramContact, requestTelegramLocation } from '@/utils/telegram'
import { formatPhoneInput, toE164, validatePhone } from '@/utils/phone'
import { Input } from '@/components/ui/input'
import { LocationField } from './subroles/shared/LocationField'
import { Button } from '@/components/ui/button'

interface TelegramConfirmStepProps {
  onContinue: () => void
}

export const TelegramConfirmStep = memo(function TelegramConfirmStep({
  onContinue,
}: TelegramConfirmStepProps) {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)
  const { updateUserWithData } = useUserUpdate()
  const { getLocation } = useGeolocation()
  const [isRequestingPhone, setIsRequestingPhone] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [manualPhone, setManualPhone] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)

  const displayName =
    user?.full_name?.trim() || user?.name?.trim() || t('onboarding.telegram.fallbackName')
  const displayUsername = user?.username?.trim()
    ? `@${user.username.trim().replace(/^@/, '')}`
    : t('onboarding.telegram.noUsername')
  const phoneFromProfile = user?.phone?.trim() || ''
  const cityFromProfile = user?.city?.trim() || user?.location?.trim() || ''
  const resolvedPhone = phoneFromProfile || manualPhone.trim()
  const isPhoneValid = useMemo(() => validatePhone(resolvedPhone).valid, [resolvedPhone])

  useEffect(() => {
    if (manualPhone || !phoneFromProfile) return
    setManualPhone(formatPhoneInput(phoneFromProfile))
  }, [manualPhone, phoneFromProfile])

  useEffect(() => {
    if (selectedCity || !cityFromProfile) return
    setSelectedCity(cityFromProfile)
  }, [cityFromProfile, selectedCity])

  const handlePhoneShare = async () => {
    if (isRequestingPhone) return
    setIsRequestingPhone(true)
    try {
      const shared = await requestTelegramContact()
      if (shared) {
        setPhoneError(null)
      }
    } finally {
      setIsRequestingPhone(false)
    }
  }

  const handleLocationShare = async () => {
    if (isRequestingLocation) return
    setIsRequestingLocation(true)
    try {
      const telegramLocation = await requestTelegramLocation()
      let city: string | null = null

      if (telegramLocation) {
        city = await getCityByCoordinates(telegramLocation.latitude, telegramLocation.longitude)
      }

      if (!city) {
        city = await getLocation()
      }

      if (!city) return
      setSelectedCity(city)
      setCityError(null)

      await updateUserWithData(
        { user: { city } },
        () => void 0,
        () => void 0
      )
    } finally {
      setIsRequestingLocation(false)
    }
  }

  const handleContinue = async () => {
    const phoneValidation = validatePhone(resolvedPhone)
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.message ?? t('phone.invalidFormat'))
      return
    }
    setPhoneError(null)

    const finalCity = selectedCity.trim() || cityFromProfile
    if (!finalCity) {
      setCityError(t('validation.requiredField'))
      return
    }
    setCityError(null)

    setIsSaving(true)
    try {
      const success = await updateUserWithData(
        {
          user: {
            phone: toE164(resolvedPhone),
            city: finalCity,
          },
        },
        () => onContinue(),
        error => {
          setPhoneError(error)
        }
      )
      if (!success) return
    } finally {
      setIsSaving(false)
    }
  }

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
        <h1 className="text-[22px] leading-[1.15] tracking-[-0.025em] font-extrabold text-foreground">
          {t('onboarding.telegram.title')}
        </h1>
        <p className="mt-1.5 max-w-[320px] text-sm leading-[1.4] text-[#7B7570]">
          {t('onboarding.telegram.subtitle')}
        </p>
      </div>

      <div className="mt-[18px] rounded-[16px] border border-border bg-[#141310] p-4 text-center">
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
            {isPhoneValid ? t('onboarding.telegram.shared') : t('onboarding.telegram.share')}
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

      <div className="mt-4 pb-[calc(14px+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]">
        <Button
          type="button"
          onClick={handleContinue}
          loading={isSaving}
          disabled={isSaving}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          {t('onboarding.telegram.next')}
        </Button>
      </div>
    </div>
  )
})

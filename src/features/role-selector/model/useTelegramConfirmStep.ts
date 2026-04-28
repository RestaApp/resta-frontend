import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useUserUpdate } from './useUserUpdate'
import { useGeolocation, getCityByCoordinates } from '@/hooks/useGeolocation'
import { requestTelegramContact, requestTelegramLocation } from '@/utils/telegram'
import { formatPhoneInput, toE164, validatePhone } from '@/utils/phone'
import { useGetUserQuery } from '@/services/api/usersApi'

interface UseTelegramConfirmStepProps {
  onContinue: () => void
}

export const useTelegramConfirmStep = ({ onContinue }: UseTelegramConfirmStepProps) => {
  const { t } = useTranslation()
  const user = useAppSelector(selectUserData)
  const { updateUserWithData } = useUserUpdate()
  const { getLocation } = useGeolocation()

  const [isRequestingPhone, setIsRequestingPhone] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [manualPhone, setManualPhone] = useState('')
  const [isPhoneShared, setIsPhoneShared] = useState(false)
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
  const userId = user?.id

  const resolvedPhone = phoneFromProfile || manualPhone.trim()
  const isPhoneValid = useMemo(() => validatePhone(resolvedPhone).valid, [resolvedPhone])
  const isPhoneFilled = isPhoneValid || isPhoneShared

  const { refetch: refetchUser } = useGetUserQuery(userId ?? 0, {
    skip: !userId,
  })

  useEffect(() => {
    if (manualPhone || !phoneFromProfile) return
    setManualPhone(formatPhoneInput(phoneFromProfile))
  }, [manualPhone, phoneFromProfile])

  useEffect(() => {
    if (selectedCity || !cityFromProfile) return
    setSelectedCity(cityFromProfile)
  }, [cityFromProfile, selectedCity])

  const handlePhoneShare = useCallback(async () => {
    if (isRequestingPhone) return
    setIsRequestingPhone(true)
    try {
      const shared = await requestTelegramContact()
      if (shared) {
        setIsPhoneShared(true)
        if (!phoneFromProfile && !manualPhone.trim()) {
          setManualPhone(
            t('onboarding.telegram.phoneFromTelegram', { defaultValue: 'Номер из Telegram' })
          )
        }
        if (userId) {
          await refetchUser()
        }
        setPhoneError(null)
      }
    } finally {
      setIsRequestingPhone(false)
    }
  }, [isRequestingPhone, manualPhone, phoneFromProfile, refetchUser, t, userId])

  const handleLocationShare = useCallback(async () => {
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
  }, [getLocation, isRequestingLocation, updateUserWithData])

  const handleContinue = useCallback(async () => {
    if (!isPhoneShared) {
      const phoneValidation = validatePhone(resolvedPhone)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.message ?? t('phone.invalidFormat'))
        return
      }
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
      await updateUserWithData(
        {
          user: {
            ...(isPhoneShared ? {} : { phone: toE164(resolvedPhone) }),
            city: finalCity,
          },
        },
        () => onContinue(),
        error => {
          setPhoneError(error)
        }
      )
    } finally {
      setIsSaving(false)
    }
  }, [
    cityFromProfile,
    isPhoneShared,
    onContinue,
    resolvedPhone,
    selectedCity,
    t,
    updateUserWithData,
  ])

  return {
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
  }
}

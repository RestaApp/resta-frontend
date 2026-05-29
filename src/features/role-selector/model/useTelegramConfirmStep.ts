import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useUserUpdate } from './useUserUpdate'
import { useGeolocation, getCityByCoordinates } from '@/hooks/useGeolocation'
import { requestTelegramContact, requestTelegramLocation } from '@/utils/telegram'
import { formatPhoneInput, toE164, validatePhone } from '@/utils/phone'
import { useGetUserQuery } from '@/services/api/usersApi'
import { setupTelegramBackButton } from '@/utils/telegram'
import { triggerHapticFeedback } from '@/utils/haptics'

interface UseTelegramConfirmStepProps {
  onContinue: () => void
  onBack: () => void
}

export const useTelegramConfirmStep = ({ onContinue, onBack }: UseTelegramConfirmStepProps) => {
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
  const [editedName, setEditedName] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)

  const tgName =
    user?.full_name?.trim() || user?.name?.trim() || t('onboarding.telegram.fallbackName')
  const displayName = editedName || tgName
  const displayUsername = user?.username?.trim()
    ? `@${user.username.trim().replace(/^@/, '')}`
    : t('onboarding.telegram.noUsername')
  const phoneFromProfile = user?.phone?.trim() || ''
  const cityFromProfile = user?.city?.trim() || ''
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

  const onBackRef = useRef(onBack)
  useLayoutEffect(() => {
    onBackRef.current = onBack
  })
  const stableBack = useCallback(() => onBackRef.current(), [])

  useEffect(() => {
    return setupTelegramBackButton(stableBack)
  }, [stableBack])

  const handlePhoneShare = useCallback(async () => {
    if (isRequestingPhone) return
    setIsRequestingPhone(true)
    try {
      const shared = await requestTelegramContact()
      if (shared) {
        setIsPhoneShared(true)
        if (userId) {
          const result = await refetchUser()
          if (result && 'data' in result && result.data?.data?.phone) {
            setManualPhone(formatPhoneInput(result.data.data.phone) || result.data.data.phone)
          }
        }
        if (!manualPhone.trim()) {
          setManualPhone(
            t('onboarding.telegram.phoneFromTelegram', { defaultValue: 'Номер из Telegram' })
          )
        }
        setPhoneError(null)
        triggerHapticFeedback('success')
      } else {
        triggerHapticFeedback('warning')
      }
    } finally {
      setIsRequestingPhone(false)
    }
  }, [isRequestingPhone, manualPhone, refetchUser, t, userId])

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

      if (!city) {
        triggerHapticFeedback('warning')
        return
      }
      setSelectedCity(city)
      setCityError(null)

      await updateUserWithData(
        { user: { city } },
        () => triggerHapticFeedback('success'),
        () => triggerHapticFeedback('error')
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
        triggerHapticFeedback('warning')
        return
      }
    }
    setPhoneError(null)

    const finalCity = selectedCity.trim() || cityFromProfile
    if (!finalCity) {
      setCityError(t('validation.requiredField'))
      triggerHapticFeedback('warning')
      return
    }
    setCityError(null)

    setIsSaving(true)
    try {
      const trimmedName = editedName.trim()
      const nameChanged = trimmedName.length > 0 && trimmedName !== tgName
      await updateUserWithData(
        {
          user: {
            ...(isPhoneShared ? {} : { phone: toE164(resolvedPhone) }),
            city: finalCity,
            ...(nameChanged ? { name: trimmedName } : {}),
          },
        },
        () => {
          triggerHapticFeedback('success')
          onContinue()
        },
        error => {
          triggerHapticFeedback('error')
          setPhoneError(error)
        }
      )
    } finally {
      setIsSaving(false)
    }
  }, [
    cityFromProfile,
    editedName,
    isPhoneShared,
    onContinue,
    resolvedPhone,
    selectedCity,
    t,
    tgName,
    updateUserWithData,
  ])

  return {
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
  }
}

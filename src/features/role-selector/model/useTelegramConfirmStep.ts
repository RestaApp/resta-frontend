import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/shared/store/user'
import { useUserUpdate } from './useUserUpdate'
import { useGeolocation, getCityByCoordinates } from '@/shared/lib/hooks/useGeolocation'
import { requestTelegramContact, requestTelegramLocation } from '@/shared/utils/telegram'
import { formatPhoneInput, toE164, validatePhone } from '@/shared/utils/phone'
import { useGetUserQuery } from '@/services/api/usersApi'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import type { UiRole } from '@/shared/types/roles.types'
import { firstLocation, sanitizeLocations } from '@/shared/utils/location'

interface UseTelegramConfirmStepProps {
  onContinue: () => void
  onBack: () => void
  selectedRole: UiRole | null
}

const isBusinessRole = (role: UiRole | null): role is 'venue' | 'supplier' =>
  role === 'venue' || role === 'supplier'

const mapServerErrorToField = (
  error: string,
  isBusiness: boolean
): 'phone' | 'city' | 'address' | 'general' => {
  const lower = error.toLowerCase()
  if (lower.includes('phone') || lower.includes('телефон')) return 'phone'
  if (lower.includes('city') || lower.includes('город')) return 'city'
  if (
    isBusiness &&
    (lower.includes('location') || lower.includes('локац') || lower.includes('адрес'))
  ) {
    return 'address'
  }
  return 'general'
}

export const useTelegramConfirmStep = ({
  onContinue,
  onBack,
  selectedRole,
}: UseTelegramConfirmStepProps) => {
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
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState<string | null>(null)

  const requiresAddress = isBusinessRole(selectedRole)

  const tgName =
    user?.full_name?.trim() || user?.name?.trim() || t('onboarding.telegram.fallbackName')
  const displayName = editedName || tgName
  const displayUsername = user?.username?.trim()
    ? `@${user.username.trim().replace(/^@/, '')}`
    : t('onboarding.telegram.noUsername')
  const phoneFromProfile = user?.phone?.trim() || ''
  const cityFromProfile = user?.city?.trim() || ''
  const addressFromProfile = firstLocation(user?.location) ?? ''
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

  useEffect(() => {
    if (address || !addressFromProfile) return
    setAddress(addressFromProfile)
  }, [address, addressFromProfile])

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

    const finalAddress = address.trim() || addressFromProfile
    if (requiresAddress && !finalAddress) {
      setAddressError(t('validation.requiredField'))
      triggerHapticFeedback('warning')
      return
    }
    setAddressError(null)

    setIsSaving(true)
    try {
      const trimmedName = editedName.trim()
      const nameChanged = trimmedName.length > 0 && trimmedName !== tgName
      const sanitizedLocation = requiresAddress ? sanitizeLocations([finalAddress]) : undefined
      await updateUserWithData(
        {
          user: {
            ...(isPhoneShared ? {} : { phone: toE164(resolvedPhone) }),
            city: finalCity,
            ...(sanitizedLocation ? { location: sanitizedLocation } : {}),
            ...(nameChanged ? { name: trimmedName } : {}),
          },
        },
        () => {
          triggerHapticFeedback('success')
          onContinue()
        },
        error => {
          triggerHapticFeedback('error')
          const lines = error
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
          let hasFieldError = false
          for (const line of lines) {
            const field = mapServerErrorToField(line, requiresAddress)
            if (field === 'phone') {
              setPhoneError(line)
              hasFieldError = true
            } else if (field === 'city') {
              setCityError(line)
              hasFieldError = true
            } else if (field === 'address') {
              setAddressError(line)
              hasFieldError = true
            }
          }
          if (!hasFieldError) {
            setPhoneError(error)
          }
        }
      )
    } finally {
      setIsSaving(false)
    }
  }, [
    address,
    addressFromProfile,
    cityFromProfile,
    editedName,
    isPhoneShared,
    onContinue,
    requiresAddress,
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
    address,
    requiresAddress,
    phoneError,
    cityError,
    addressError,
    isPhoneFilled,
    isPhoneShared,
    isRequestingPhone,
    isRequestingLocation,
    isSaving,
    handlePhoneShare,
    handleLocationShare,
    handleContinue,
    setManualPhone,
    setSelectedCity,
    setAddress,
    setPhoneError,
    setCityError,
    setAddressError,
  }
}

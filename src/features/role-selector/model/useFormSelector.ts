/**
 * Переиспользуемый хук для управления формой (ресторан/поставщик)
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { isPromise } from '@/utils/promise'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'

export interface FormData {
  name: string
  type: string | null
  types: string[]
  city: string
}

interface UseFormSelectorProps {
  onContinue?: (formData: FormData) => Promise<boolean> | void
  multiType?: boolean
  /** Не требовать поле name (используется существующее значение из профиля). */
  skipNameValidation?: boolean
  /** Не требовать поле city (значение берётся из профиля). */
  skipCityValidation?: boolean
}

export const useFormSelector = ({
  onContinue,
  multiType = false,
  skipNameValidation = false,
  skipCityValidation = false,
}: UseFormSelectorProps) => {
  const user = useAppSelector(selectUserData)
  const [formData, setFormData] = useState<FormData>({
    name: user?.full_name?.trim() || user?.name?.trim() || '',
    type: null,
    types: [],
    city: user?.city?.trim() || user?.location?.trim() || '',
  })

  // Хук для геолокации
  const { getLocation, isLoading: isLoadingLocation } = useGeolocation()

  const handleLocationRequest = useCallback(async () => {
    const city = await getLocation()
    if (city) {
      setFormData(prev => ({
        ...prev,
        city,
      }))
    }
  }, [getLocation])

  const handleFormDataUpdate = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleContinue = useCallback(async (): Promise<boolean> => {
    const hasType = multiType ? formData.types.length > 0 : !!formData.type
    const nameOk = skipNameValidation || formData.name.trim() !== ''
    const cityOk = skipCityValidation || formData.city.trim() !== ''
    if (!nameOk || !hasType || !cityOk) {
      return false
    }

    if (!onContinue) {
      return false
    }

    try {
      const result = onContinue(formData)

      if (isPromise<boolean | void>(result)) {
        const promiseResult = await result
        return promiseResult === true
      }

      return true
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
      return false
    }
  }, [formData, onContinue, multiType, skipNameValidation, skipCityValidation])

  return {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  }
}

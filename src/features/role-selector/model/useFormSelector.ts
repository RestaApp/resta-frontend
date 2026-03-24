/**
 * Переиспользуемый хук для управления формой (ресторан/поставщик)
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { isPromise } from '@/utils/promise'

export interface FormData {
  name: string
  type: string | null
  types: string[]
  city: string
}

interface UseFormSelectorProps {
  onContinue?: (formData: FormData) => Promise<boolean> | void
  multiType?: boolean
}

export const useFormSelector = ({ onContinue, multiType = false }: UseFormSelectorProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: null,
    types: [],
    city: '',
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
    if (!formData.name.trim() || !hasType || !formData.city.trim()) {
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
  }, [formData, onContinue, multiType])

  return {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  }
}

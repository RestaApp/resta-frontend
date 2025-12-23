/**
 * Хук для бизнес-логики формы ресторана
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '../../../../../hooks/useGeolocation'

export interface RestaurantFormData {
  name: string
  format: string | null
  city: string
}

interface UseRestaurantFormSelectorProps {
  restaurantFormats?: string[]
  onContinue?: (formData: RestaurantFormData) => Promise<boolean> | void
  onBack: () => void
}

export function useRestaurantFormSelector({
  restaurantFormats: _restaurantFormats = [],
  onContinue,
  onBack: _onBack,
}: UseRestaurantFormSelectorProps) {
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    format: null,
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

  const handleFormDataUpdate = useCallback((updates: Partial<RestaurantFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleContinue = useCallback(async () => {
    if (!formData.name.trim() || !formData.format || !formData.city.trim()) {
      return
    }

    if (!onContinue) {
      return
    }

    try {
      const result = onContinue(formData)

      // Проверяем, является ли результат промисом
      const isPromise =
        result !== undefined &&
        result !== null &&
        typeof result === 'object' &&
        'then' in result &&
        typeof (result as Promise<unknown>).then === 'function'

      if (isPromise) {
        await (result as Promise<boolean | void>)
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
    }
  }, [formData, onContinue])

  return {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  }
}


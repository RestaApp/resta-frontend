/**
 * Переиспользуемый хук для управления формой (ресторан/поставщик)
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { isPromise } from '@/utils/promise'

export interface FormData {
    name: string
    type: string | null
    city: string
}

interface UseFormSelectorProps {
    onContinue?: (formData: FormData) => Promise<boolean> | void
}

export const useFormSelector = ({ onContinue }: UseFormSelectorProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: null,
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
        if (!formData.name.trim() || !formData.type || !formData.city.trim()) {
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
    }, [formData, onContinue])

    return {
        formData,
        isLoadingLocation,
        handleLocationRequest,
        handleFormDataUpdate,
        handleContinue,
    }
}


/**
 * Переиспользуемый хук для управления формой (ресторан/поставщик)
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '../../../../../hooks/useGeolocation'
import { isPromise } from '../../../../../utils/promise'

export interface FormData {
    name: string
    type: string | null
    city: string
}

interface UseFormSelectorProps {
    onContinue?: (formData: FormData) => Promise<boolean> | void
    onBack: () => void
}

export const useFormSelector = ({ onContinue, onBack: _onBack }: UseFormSelectorProps) => {
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

    const handleContinue = useCallback(async () => {
        if (!formData.name.trim() || !formData.type || !formData.city.trim()) {
            return
        }

        if (!onContinue) {
            return
        }

        try {
            const result = onContinue(formData)

            if (isPromise<boolean | void>(result)) {
                await result
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


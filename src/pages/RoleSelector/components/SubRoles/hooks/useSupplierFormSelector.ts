/**
 * Хук для бизнес-логики формы поставщика
 */

import { useState, useCallback } from 'react'
import { useGeolocation } from '../../../../../hooks/useGeolocation'

export interface SupplierFormData {
    name: string
    type: string | null
    city: string
}

interface UseSupplierFormSelectorProps {
    supplierTypes?: string[]
    onContinue?: (formData: SupplierFormData) => Promise<boolean> | void
    onBack: () => void
}

export function useSupplierFormSelector({
    supplierTypes: _supplierTypes = [],
    onContinue,
    onBack: _onBack,
}: UseSupplierFormSelectorProps) {
    const [formData, setFormData] = useState<SupplierFormData>({
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

    const handleFormDataUpdate = useCallback((updates: Partial<SupplierFormData>) => {
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


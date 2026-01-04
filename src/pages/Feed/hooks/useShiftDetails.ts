/**
 * Хук для работы с деталями смены
 * Инкапсулирует бизнес-логику форматирования и обработки данных смены
 */

import { useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import {
    formatHourlyRate,
    formatShiftType,
    formatApplicationsCount,
    getVacancyTitle,
} from '../utils/formatting'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'

interface RestaurantInfo {
    rating: number | null
    reviews: number | null
    bio: string | null
    profile: {
        city?: string
        restaurant_format?: string
        format?: string
        cuisine_types?: string[]
    } | null
}

interface UseShiftDetailsReturn {
    restaurantInfo: RestaurantInfo | null
    hourlyRate: string | null
    shiftTypeLabel: string | null
    vacancyTitle: string
    positionLabel: string | null
    specializationLabel: string | null
    applicationsInfo: { value: string; label: string } | null
}

/**
 * Хук для обработки и форматирования данных смены
 */
export const useShiftDetails = (
    shift: Shift | null,
    vacancyData?: VacancyApiItem | null
): UseShiftDetailsReturn => {
    // Мемоизация данных о ресторане
    const restaurantInfo = useMemo<RestaurantInfo | null>(() => {
        if (!vacancyData?.user) return null

        const { user } = vacancyData
        const hasRating = user.average_rating !== undefined && user.average_rating > 0
        const hasReviews = user.total_reviews !== undefined && user.total_reviews > 0

        return {
            rating: hasRating ? (user.average_rating ?? null) : null,
            reviews: hasReviews ? (user.total_reviews ?? null) : null,
            bio: user.bio || null,
            profile: user.restaurant_profile || null,
        }
    }, [vacancyData])

    // Форматирование почасовой ставки
    const hourlyRate = useMemo(() => formatHourlyRate(vacancyData?.hourly_rate), [vacancyData])

    // Форматирование типа смены
    const shiftTypeLabel = useMemo(() => formatShiftType(vacancyData?.shift_type), [vacancyData])

    // Заголовок вакансии
    const vacancyTitle = useMemo(
        () => getVacancyTitle(vacancyData?.title, shift?.position),
        [vacancyData, shift]
    )

    // Позиция с расшифровкой
    const positionLabel = useMemo(() => {
        if (!vacancyData?.position) return null
        return getEmployeePositionLabel(vacancyData.position)
    }, [vacancyData])

    // Специализация с расшифровкой
    const specializationLabel = useMemo(() => {
        if (!vacancyData?.specialization) return null
        return getSpecializationLabel(vacancyData.specialization)
    }, [vacancyData])

    // Информация о заявках
    const applicationsInfo = useMemo(() => {
        if (vacancyData?.applications_count === undefined) return null
        return formatApplicationsCount(vacancyData.applications_count)
    }, [vacancyData])

    return {
        restaurantInfo,
        hourlyRate,
        shiftTypeLabel,
        vacancyTitle,
        positionLabel,
        specializationLabel,
        applicationsInfo,
    }
}


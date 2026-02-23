import { useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import {
  formatApplicationsCount,
  formatHourlyRate,
  formatShiftType,
  getVacancyTitle,
} from '../utils/formatting'
import { useLabels } from '@/shared/i18n/hooks'

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

interface AboutVenueInfo {
  canShow: boolean
  bio: string
  city: string
  formatKey: string | null
  cuisineTypes: string[]
}

export interface UseShiftDetailsReturn {
  restaurantInfo: RestaurantInfo | null
  aboutVenue: AboutVenueInfo | null
  hourlyRate: string | null
  shiftTypeLabel: string | null
  vacancyTitle: string
  positionLabel: string | null
  specializationLabel: string | null
  /** Список специализаций для отображения тегами */
  specializations: string[]
  applicationsInfo: { value: string; label: string } | null
}

export const useShiftDetails = (
  shift: Shift | null,
  vacancyData?: VacancyApiItem | null
): UseShiftDetailsReturn => {
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()

  const restaurantInfo = useMemo<RestaurantInfo | null>(() => {
    const user = vacancyData?.user
    if (!user) return null

    const ratingRaw =
      typeof user.average_rating === 'number' ? user.average_rating : Number(user.average_rating)
    const rating = Number.isFinite(ratingRaw) && ratingRaw > 0 ? ratingRaw : null

    const reviews =
      typeof user.total_reviews === 'number' && user.total_reviews > 0 ? user.total_reviews : null

    return {
      rating,
      reviews,
      bio: user.bio || null,
      profile: user.restaurant_profile || null,
    }
  }, [vacancyData])

  const aboutVenue = useMemo<AboutVenueInfo | null>(() => {
    const isRestaurantRole = vacancyData?.user?.role === 'restaurant'
    if (!isRestaurantRole || !restaurantInfo) return null

    const bio = (restaurantInfo.bio ?? '').trim()
    const city = (restaurantInfo.profile?.city ?? '').trim()
    const formatKey =
      [restaurantInfo.profile?.restaurant_format, restaurantInfo.profile?.format]
        .map(v => (typeof v === 'string' ? v.trim() : ''))
        .find(Boolean) ?? null
    const cuisineTypes = (restaurantInfo.profile?.cuisine_types ?? [])
      .map(v => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean)

    const canShow = Boolean(bio || city || formatKey || cuisineTypes.length > 0)
    return canShow ? { canShow, bio, city, formatKey, cuisineTypes } : null
  }, [vacancyData, restaurantInfo])

  const hourlyRate = useMemo(
    () => formatHourlyRate(vacancyData?.hourly_rate ?? null),
    [vacancyData]
  )
  const shiftTypeLabel = useMemo(
    () => formatShiftType(vacancyData?.shift_type ?? null),
    [vacancyData]
  )

  const vacancyTitle = useMemo(
    () => getVacancyTitle(vacancyData?.title ?? null, shift?.position ?? null),
    [vacancyData, shift]
  )

  const positionLabel = useMemo(() => {
    if (!vacancyData?.position) return null
    return getEmployeePositionLabel(vacancyData.position)
  }, [vacancyData, getEmployeePositionLabel])

  const specializationLabel = useMemo(() => {
    if (!vacancyData?.specialization) return null
    return getSpecializationLabel(vacancyData.specialization)
  }, [vacancyData, getSpecializationLabel])

  const specializations = useMemo(() => {
    const list = vacancyData?.specializations ?? []
    if (list.length > 0) return list
    if (vacancyData?.specialization)
      return [vacancyData.specialization]
    return []
  }, [vacancyData?.specializations, vacancyData?.specialization])

  const applicationsInfo = useMemo(() => {
    if (vacancyData?.applications_count === undefined) return null
    return formatApplicationsCount(vacancyData.applications_count)
  }, [vacancyData])

  return {
    restaurantInfo,
    aboutVenue,
    hourlyRate,
    shiftTypeLabel,
    vacancyTitle,
    positionLabel,
    specializationLabel,
    specializations,
    applicationsInfo,
  }
}

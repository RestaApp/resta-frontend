/**
 * Хуки для доступа к переводам лейблов (позиции, специализации, форматы и т.д.)
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const humanizeLabel = (value: string): string => {
  const normalized = value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\s+/g, ' ')

  if (!normalized) return value
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

/** Приводит значение специализации к ключу labels.specialization (snake_case). */
const normalizeSpecializationKey = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return value
  return trimmed
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/** Приводит значения из API каталогов к ключам labels.* (snake_case). */
const normalizeCatalogKey = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return value
  return trimmed
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

export function useLabels() {
  const { t } = useTranslation()

  const resolve = useCallback(
    (key: string, fallback: string) => {
      const res = t(key)
      return res === key ? humanizeLabel(fallback) : res
    },
    [t]
  )

  const getSupplierTypeLabel = useCallback(
    (value: string) => resolve(`labels.supplierType.${value}`, value),
    [resolve]
  )
  const getSupplierTypeDescription = useCallback(
    (value: string) => {
      const key = `labels.supplierTypeDesc.${value}`
      const res = t(key)
      return res === key ? '' : res
    },
    [t]
  )
  const getRestaurantFormatLabel = useCallback(
    (value: string) => {
      const normalized = normalizeCatalogKey(value)
      const keyRaw = `labels.restaurantFormat.${value}`
      const keyNorm = `labels.restaurantFormat.${normalized}`
      const r0 = t(keyRaw)
      if (r0 !== keyRaw) return r0
      const r1 = t(keyNorm)
      if (r1 !== keyNorm) return r1
      return resolve(keyRaw, value)
    },
    [resolve, t]
  )
  const getRestaurantFormatDescription = useCallback(
    (value: string) => {
      const normalized = normalizeCatalogKey(value)
      const keyRaw = `labels.restaurantFormatDesc.${value}`
      const keyNorm = `labels.restaurantFormatDesc.${normalized}`
      const r0 = t(keyRaw)
      if (r0 !== keyRaw) return r0
      const r1 = t(keyNorm)
      return r1 === keyNorm ? '' : r1
    },
    [t]
  )
  const getCuisineTypeLabel = useCallback(
    (value: string) => resolve(`labels.cuisineType.${value}`, value),
    [resolve]
  )
  const getEmployeePositionLabel = useCallback(
    (value: string) => {
      const key1 = `labels.position.${value}`
      const key2 = `labels.position.${value.toLowerCase()}`
      const r1 = t(key1)
      if (r1 !== key1) return r1
      const r2 = t(key2)
      return r2 !== key2 ? r2 : value
    },
    [t]
  )
  const getEmployeePositionDescription = useCallback(
    (value: string) => {
      const key = `labels.positionDesc.${value.toLowerCase()}`
      const res = t(key)
      return res === key ? '' : res
    },
    [t]
  )
  const getUiRoleLabel = useCallback(
    (value: string) => resolve(`labels.userRole.${value}`, value),
    [resolve]
  )
  const getSpecializationLabel = useCallback(
    (value: string) => {
      const normalized = normalizeSpecializationKey(value)
      const keyRaw = `labels.specialization.${value}`
      const keyNorm = `labels.specialization.${normalized}`
      const r0 = t(keyRaw)
      if (r0 !== keyRaw) return r0
      const r1 = t(keyNorm)
      if (r1 !== keyNorm) return r1
      return resolve(keyRaw, value)
    },
    [resolve, t]
  )

  return {
    getSupplierTypeLabel,
    getSupplierTypeDescription,
    getRestaurantFormatLabel,
    getRestaurantFormatDescription,
    getCuisineTypeLabel,
    getEmployeePositionLabel,
    getEmployeePositionDescription,
    getUiRoleLabel,
    getSpecializationLabel,
  }
}

export function useDrawerTitle() {
  const { t } = useTranslation()

  return useCallback(
    (position: string | null, hasSpecializations: boolean): string => {
      if (!position || !hasSpecializations) return t('drawer.default')
      return t(`drawer.${position.toLowerCase()}`) || t('drawer.default')
    },
    [t]
  )
}

export function useProfileFormLabels() {
  const { t } = useTranslation()

  const getBioLabelSuffix = useCallback(
    (apiRole: string | null) => {
      if (apiRole === 'restaurant') return t('profile.bioSuffixVenue')
      if (apiRole === 'supplier') return t('profile.bioSuffixSupplier')
      return t('profile.bioSuffixSelf')
    },
    [t]
  )

  const getWorkSummaryLabel = useCallback(
    (apiRole: string | null) => {
      return apiRole === 'employee'
        ? t('profile.workSummaryResume')
        : t('profile.workSummaryExperience')
    },
    [t]
  )

  return { getBioLabelSuffix, getWorkSummaryLabel }
}

/**
 * Хуки для доступа к переводам лейблов (позиции, специализации, форматы и т.д.)
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useLabels() {
  const { t } = useTranslation()

  const resolve = useCallback(
    (key: string, fallback: string) => {
      const res = t(key)
      return res === key ? fallback : res
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
    (value: string) => resolve(`labels.restaurantFormat.${value}`, value),
    [resolve]
  )
  const getRestaurantFormatDescription = useCallback(
    (value: string) => {
      const key = `labels.restaurantFormatDesc.${value}`
      const res = t(key)
      return res === key ? '' : res
    },
    [t]
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
    (value: string) => resolve(`labels.specialization.${value}`, value),
    [resolve]
  )

  return {
    getSupplierTypeLabel,
    getSupplierTypeDescription,
    getRestaurantFormatLabel,
    getRestaurantFormatDescription,
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

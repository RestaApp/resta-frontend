/**
 * Хуки для доступа к переводам лейблов (позиции, специализации, форматы и т.д.)
 */

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useLabels() {
  const { t } = useTranslation()

  const getSupplierTypeLabel = useCallback(
    (value: string) => t(`labels.supplierType.${value}`) || value,
    [t]
  )
  const getSupplierTypeDescription = useCallback(
    (value: string) => t(`labels.supplierTypeDesc.${value}`) || '',
    [t]
  )
  const getRestaurantFormatLabel = useCallback(
    (value: string) => t(`labels.restaurantFormat.${value}`) || value,
    [t]
  )
  const getRestaurantFormatDescription = useCallback(
    (value: string) => t(`labels.restaurantFormatDesc.${value}`) || '',
    [t]
  )
  const getEmployeePositionLabel = useCallback(
    (value: string) =>
      t(`labels.position.${value}`) || t(`labels.position.${value.toLowerCase()}`) || value,
    [t]
  )
  const getEmployeePositionDescription = useCallback(
    (value: string) => t(`labels.positionDesc.${value.toLowerCase()}`) || '',
    [t]
  )
  const getUiRoleLabel = useCallback((value: string) => t(`labels.userRole.${value}`) || value, [t])
  const getSpecializationLabel = useCallback(
    (value: string) => t(`labels.specialization.${value}`) || value,
    [t]
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

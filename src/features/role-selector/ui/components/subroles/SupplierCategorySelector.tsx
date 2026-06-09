/**
 * Выбор категории и типов поставщика на финальном шаге supplier-онбординга.
 */

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingState } from './shared/LoadingState'
import { RoleDetailsStep } from './shared/RoleDetailsStep'
import { useSupplierTypes } from '../../../model/hooks/useSupplierTypes'
import { useLabels } from '@/shared/i18n/hooks'
import { getSupplierCategoryIcon } from '@/shared/constants/role-icons'

interface SupplierCategorySelectorProps {
  categories: string[]
  onContinue: (category: string, types: string[]) => Promise<boolean> | boolean | void
  onBack: () => void
  isLoading?: boolean
  isFetching?: boolean
}

export const SupplierCategorySelector = memo(function SupplierCategorySelector({
  categories,
  onContinue,
  onBack,
  isLoading = false,
  isFetching = false,
}: SupplierCategorySelectorProps) {
  const { t } = useTranslation()
  const { getSupplierTypeLabel } = useLabels()
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    supplierTypes,
    isLoading: isLoadingTypes,
    isFetching: isFetchingTypes,
  } = useSupplierTypes({
    enabled: selected !== null,
    supplierCategory: selected ?? 'products',
  })

  const handleToggle = useCallback((value: string) => {
    setSelected(prev => (prev === value ? null : value))
    setSelectedTypes([])
  }, [])

  const handleTypeToggle = useCallback((value: string) => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    )
  }, [])

  const getCategoryLabel = useCallback(
    (category: string) => t(`roles.supplierCategories.${category}`, { defaultValue: category }),
    [t]
  )

  const handleConfirm = useCallback(async () => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      await onContinue(selected, selectedTypes)
    } finally {
      setIsSubmitting(false)
    }
  }, [selected, selectedTypes, onContinue])

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!categories.length) {
    return <LoadingState message={t('roles.categoriesError')} />
  }

  const hasLoadedTypes = selected !== null && !isLoadingTypes && !isFetchingTypes
  const canContinue = selected !== null && !isSubmitting

  return (
    <RoleDetailsStep
      title={t('roles.supplierCategoryTitle')}
      subtitle={t('roles.supplierCategoryDescription')}
      groups={[
        {
          id: 'category',
          label: t('roles.supplierCategoriesLabel', { defaultValue: 'КАТЕГОРИИ' }),
          values: categories,
          selectedValues: selected ? [selected] : [],
          onToggle: handleToggle,
          getLabel: getCategoryLabel,
          getIcon: getSupplierCategoryIcon,
          getAriaLabel: (_category, label) => t('aria.selectSupplierCategory', { label }),
        },
        ...(selected
          ? [
              {
                id: 'types',
                label: t('roles.supplierTypeLabel'),
                hint: supplierTypes.length > 1 ? t('roles.specializationMultiHint') : undefined,
                values: supplierTypes,
                selectedValues: selectedTypes,
                onToggle: handleTypeToggle,
                getLabel: getSupplierTypeLabel,
                getAriaLabel: (_: string, label: string) => t('aria.selectType', { label }),
                emptyText: hasLoadedTypes ? t('profile.supplierTypesEmpty') : undefined,
              },
            ]
          : []),
      ]}
      ctaText={t('roles.supplierCategoryCta', { defaultValue: 'Смотреть рестораны' })}
      onContinue={handleConfirm}
      onBack={onBack}
      canContinue={canContinue}
      isSubmitting={isSubmitting}
      continueButtonAriaLabel={t('common.continue')}
    />
  )
})

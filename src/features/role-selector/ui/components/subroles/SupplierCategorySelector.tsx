/**
 * Выбор категории и типов поставщика на финальном шаге supplier-онбординга.
 */

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TagGroup } from '@/shared/ui/TagGroup'
import { LoadingState } from './shared/LoadingState'
import { useSupplierTypes } from '../../../model/hooks/useSupplierTypes'
import { useLabels } from '@/shared/i18n/hooks'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT } from '../OnboardingBottomCta'
import { OnboardingSection, OnboardingStepLayout } from '../OnboardingStepLayout'

const CATEGORY_EMOJI: Record<string, string> = {
  products: '📦',
  spices: '🌶',
  herbs: '🌿',
  meat: '🥩',
  fish: '🐟',
  vegetables: '🥬',
  cheese: '🧀',
  alcohol: '🍷',
  packaging: '📦',
  equipment: '🔧',
  consumables: '🧺',
  services: '🎧',
  logistics: '🚚',
}

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
    (category: string) => {
      const label = t(`roles.supplierCategories.${category}`, { defaultValue: category })
      const emoji = CATEGORY_EMOJI[category] ?? '📦'
      return `${emoji} ${label}`
    },
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

  const isTypesLoading = isLoadingTypes || isFetchingTypes
  const shouldSelectType = selected !== null && !isTypesLoading && supplierTypes.length > 0
  const canContinue =
    selected !== null &&
    !isSubmitting &&
    !isTypesLoading &&
    (!shouldSelectType || selectedTypes.length > 0)

  return (
    <OnboardingStepLayout
      currentStep={3}
      totalSteps={3}
      title={t('roles.supplierCategoryTitle')}
      subtitle={t('roles.supplierCategoryDescription')}
      bottomSpace={ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT}
    >
      <OnboardingSection label={t('roles.supplierCategoriesLabel', { defaultValue: 'КАТЕГОРИИ' })}>
        <TagGroup
          values={categories}
          selectedValues={selected ? [selected] : []}
          onToggle={handleToggle}
          getLabel={getCategoryLabel}
          getAriaLabel={(category, label) =>
            t('aria.selectSupplierCategory', {
              label: label.replace(`${CATEGORY_EMOJI[category] ?? '📦'} `, ''),
            })
          }
          size="lg"
        />
      </OnboardingSection>

      {selected ? (
        <OnboardingSection
          label={t('roles.supplierTypeLabel')}
          hint={supplierTypes.length > 1 ? t('roles.specializationMultiHint') : undefined}
          className="mt-5"
        >
          {isTypesLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading')}...</div>
          ) : supplierTypes.length > 0 ? (
            <TagGroup
              values={supplierTypes}
              selectedValues={selectedTypes}
              onToggle={handleTypeToggle}
              getLabel={getSupplierTypeLabel}
              getAriaLabel={(_, label) => t('aria.selectType', { label })}
              size="lg"
            />
          ) : (
            <div className="text-sm text-muted-foreground">{t('profile.supplierTypesEmpty')}</div>
          )}
        </OnboardingSection>
      ) : null}

      <OnboardingBottomCta
        onClick={handleConfirm}
        loading={isSubmitting}
        disabled={!canContinue}
        showFillLaterHint
      >
        {t('roles.supplierCategoryCta', { defaultValue: 'Смотреть рестораны' })}
      </OnboardingBottomCta>
    </OnboardingStepLayout>
  )
})

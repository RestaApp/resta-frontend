/**
 * Выбор категории и типов поставщика на финальном шаге supplier-онбординга.
 */

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TagGroup } from '@/shared/ui/TagGroup'
import { OnboardingProgress } from '../OnboardingProgress'
import { LoadingState } from './shared/LoadingState'
import { useSupplierTypes } from '../../../model/hooks/useSupplierTypes'
import { useLabels } from '@/shared/i18n/hooks'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT } from '../OnboardingBottomCta'

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
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <div
        className={`flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] ${ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT} overflow-y-auto`}
      >
        <OnboardingProgress current={3} total={3} tone="supplier" className="mb-[14px]" />
        <div className="mb-4">
          <h1 className="font-sans font-extrabold text-display leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
            {t('roles.supplierCategoryTitle')}
          </h1>
          <p className="text-meta leading-snug text-muted-foreground">
            {t('roles.supplierCategoryDescription')}
          </p>
        </div>

        <div className="max-w-md w-full">
          <div className="mb-2 font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
            {t('roles.supplierCategoriesLabel', { defaultValue: 'КАТЕГОРИИ' })}
          </div>
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
            tone="supplier"
          />
        </div>

        {selected ? (
          <div className="mt-5 max-w-md w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
                {t('roles.supplierTypeLabel')}
              </div>
              {supplierTypes.length > 1 ? (
                <div className="text-meta text-muted-foreground">
                  {t('roles.specializationMultiHint')}
                </div>
              ) : null}
            </div>
            {isTypesLoading ? (
              <div className="text-meta text-muted-foreground">{t('common.loading')}...</div>
            ) : supplierTypes.length > 0 ? (
              <TagGroup
                values={supplierTypes}
                selectedValues={selectedTypes}
                onToggle={handleTypeToggle}
                getLabel={getSupplierTypeLabel}
                getAriaLabel={(_, label) => t('aria.selectType', { label })}
                tone="supplier"
              />
            ) : (
              <div className="text-meta text-muted-foreground">
                {t('profile.supplierTypesEmpty')}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <OnboardingBottomCta
        onClick={handleConfirm}
        loading={isSubmitting}
        disabled={!canContinue}
        tone="supplier"
        showFillLaterHint
      >
        {t('roles.supplierCategoryCta', { defaultValue: 'Смотреть рестораны →' })}
      </OnboardingBottomCta>
    </div>
  )
})

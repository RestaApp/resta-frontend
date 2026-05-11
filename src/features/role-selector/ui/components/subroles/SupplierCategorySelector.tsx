/**
 * Выбор категории и типов поставщика на финальном шаге supplier-онбординга.
 */

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { OnboardingProgress } from '../OnboardingProgress'
import { LoadingState } from './shared/LoadingState'
import { useSupplierTypes } from '../../../model/hooks/useSupplierTypes'
import { useLabels } from '@/shared/i18n/hooks'

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
      <div className="flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] pb-[calc(6.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] overflow-y-auto">
        <OnboardingProgress current={3} total={3} tone="supplier" className="mb-[14px]" />
        <div className="mb-4">
          <h1 className="font-sans font-extrabold text-[22px] leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
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
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const label = t(`roles.supplierCategories.${category}`, { defaultValue: category })
              const emoji = CATEGORY_EMOJI[category] ?? '📦'
              return (
                <SelectableTagButton
                  key={category}
                  value={category}
                  label={`${emoji} ${label}`}
                  tone="supplier"
                  isSelected={selected === category}
                  onClick={handleToggle}
                  ariaLabel={t('aria.selectSupplierCategory', { label })}
                />
              )
            })}
          </div>
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
              <div className="flex flex-wrap gap-2">
                {supplierTypes.map(type => (
                  <SelectableTagButton
                    key={type}
                    value={type}
                    label={getSupplierTypeLabel(type)}
                    tone="supplier"
                    isSelected={selectedTypes.includes(type)}
                    onClick={handleTypeToggle}
                    ariaLabel={t('aria.selectType', { label: getSupplierTypeLabel(type) })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-meta text-muted-foreground">
                {t('profile.supplierTypesEmpty')}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 px-4 pt-3 pb-safe-cta backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md">
          <Button
            type="button"
            onClick={handleConfirm}
            loading={isSubmitting}
            disabled={!canContinue}
            variant="gradient"
            size="lg"
            className="w-full bg-role-supplier hover:bg-role-supplier/90 active:bg-role-supplier/80"
          >
            {t('roles.supplierCategoryCta', { defaultValue: 'Смотреть рестораны →' })}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground opacity-70">
            {t('profile.fillLaterHint')}
          </p>
        </div>
      </div>
    </div>
  )
})

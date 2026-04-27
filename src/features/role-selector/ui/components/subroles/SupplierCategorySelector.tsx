/**
 * Выбор категории поставщика перед типами (GET /api/v1/catalogs/supplier_categories)
 */

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Boxes, Headphones, Package, Truck, type LucideIcon, Wrench } from 'lucide-react'
import { SectionHeader } from '@/components/ui'
import { CardSelect } from '@/components/ui/card-select'
import { OnboardingProgress } from '../OnboardingProgress'
import { LoadingState } from './shared/LoadingState'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  products: Package,
  equipment: Wrench,
  consumables: Boxes,
  services: Headphones,
  logistics: Truck,
}

interface SupplierCategorySelectorProps {
  categories: string[]
  onContinue: (category: string) => void
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

  const handleSelect = useCallback(
    (category: string) => {
      onContinue(category)
    },
    [onContinue]
  )

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!categories.length) {
    return <LoadingState message={t('roles.categoriesError')} />
  }

  return (
    <div className="bg-background flex flex-col">
      <div className="flex-1 flex flex-col ui-density-page ui-density-py overflow-y-auto">
        <OnboardingProgress current={2} total={2} className="ui-density-mb-lg" />
        <SectionHeader
          title={t('roles.supplierCategoryTitle')}
          description={t('roles.supplierCategoryDescription')}
          className="ui-density-mb-lg"
        />

        <div className="flex-1 ui-density-stack-sm max-w-md mx-auto w-full">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category] ?? Package
            const title = t(`roles.supplierCategories.${category}`, { defaultValue: category })
            const description = t(`roles.supplierCategoriesDesc.${category}`, {
              defaultValue: '',
            })
            return (
              <CardSelect<string>
                key={category}
                id={category}
                title={title}
                description={description || undefined}
                image={<Icon className="w-6 h-6 text-white" aria-hidden />}
                imageType="icon"
                isSelected={false}
                index={index}
                layout="horizontal"
                onSelect={() => handleSelect(category)}
                ariaLabel={t('aria.selectSupplierCategory', { label: title })}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})

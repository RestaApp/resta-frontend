/**
 * Компонент выбора типа поставщика
 */

import { memo, useMemo } from 'react'
import { Package, Wrench, Briefcase, Truck } from 'lucide-react'
import { OptionSelector, type OptionItem } from './components/OptionSelector'
import { getSupplierTypeLabel, getSupplierTypeDescription } from '../../../../constants/labels'
import type { JSX, ComponentType } from 'react'

interface SupplierTypeSelectorProps {
  onSelectType: (typeValue: string) => void
  selectedType: string | null
  onContinue: () => void
  onBack: () => void
  supplierTypes?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

const TYPE_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  products: Package,
  equipment: Wrench,
  services: Briefcase,
  logistics: Truck,
}

const TYPE_COLOR_MAP: Record<string, string> = {
  products: 'from-blue-500 to-cyan-500',
  equipment: 'from-orange-500 to-red-500',
  services: 'from-green-500 to-emerald-500',
  logistics: 'from-purple-500 to-pink-500',
}

export const SupplierTypeSelector = memo(function SupplierTypeSelector({
  onSelectType,
  selectedType,
  onContinue,
  onBack,
  supplierTypes,
  isLoading = false,
  isFetching = false,
}: SupplierTypeSelectorProps): JSX.Element {
  const options = useMemo<OptionItem[]>(() => {
    if (!supplierTypes || supplierTypes.length === 0) {
      return []
    }

    return supplierTypes.map(type => ({
      value: type,
      label: getSupplierTypeLabel(type),
      description: getSupplierTypeDescription(type),
      icon: TYPE_ICON_MAP[type] || Package,
      color: TYPE_COLOR_MAP[type] || 'from-indigo-500 to-blue-600',
    }))
  }, [supplierTypes])

  return (
    <OptionSelector
      title="Выберите тип поставщика"
      description="Укажите, что вы предлагаете"
      options={options}
      selectedValue={selectedType}
      onSelect={onSelectType}
      onContinue={onContinue}
      onBack={onBack}
      isLoading={isLoading}
      isFetching={isFetching}
      continueButtonAriaLabel="Продолжить выбор типа поставщика"
      hintMessage="Вы можете изменить тип поставщика позже в настройках профиля"
    />
  )
})

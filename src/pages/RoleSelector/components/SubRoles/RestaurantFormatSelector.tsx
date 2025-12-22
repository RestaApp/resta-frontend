/**
 * Компонент выбора формата ресторана
 */

import { memo, useMemo } from 'react'
import {
  UtensilsCrossed,
  Coffee,
  Store,
  ChefHat,
  Pizza,
  Croissant,
  Truck,
  Sparkles,
  Beer,
  Zap,
} from 'lucide-react'
import { OptionSelector, type OptionItem } from './components/OptionSelector'
import {
  getRestaurantFormatLabel,
  getRestaurantFormatDescription,
} from '../../../../constants/labels'
import type { JSX, ComponentType } from 'react'

interface RestaurantFormatSelectorProps {
  onSelectFormat: (formatValue: string) => void
  selectedFormat: string | null
  onContinue: () => void
  onBack: () => void
  restaurantFormats?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

const FORMAT_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  full_service: UtensilsCrossed,
  cafe: Coffee,
  sushi_bar: ChefHat,
  bistro: Store,
  fast_food: Zap,
  bar: Beer,
  pizzeria: Pizza,
  bakery: Croissant,
  food_truck: Truck,
  catering: Sparkles,
}

const FORMAT_COLOR_MAP: Record<string, string> = {
  full_service: 'from-orange-500 to-red-500',
  cafe: 'from-amber-500 to-orange-500',
  sushi_bar: 'from-blue-500 to-cyan-500',
  bistro: 'from-green-500 to-emerald-500',
  fast_food: 'from-yellow-500 to-orange-500',
  bar: 'from-purple-500 to-pink-500',
  pizzeria: 'from-red-500 to-orange-500',
  bakery: 'from-amber-400 to-yellow-500',
  food_truck: 'from-indigo-500 to-blue-500',
  catering: 'from-pink-500 to-rose-500',
}

export const RestaurantFormatSelector = memo(function RestaurantFormatSelector({
  onSelectFormat,
  selectedFormat,
  onContinue,
  onBack,
  restaurantFormats,
  isLoading = false,
  isFetching = false,
}: RestaurantFormatSelectorProps): JSX.Element {
  const options = useMemo<OptionItem[]>(() => {
    if (!restaurantFormats || restaurantFormats.length === 0) {
      return []
    }

    return restaurantFormats.map(format => ({
      value: format,
      label: getRestaurantFormatLabel(format),
      description: getRestaurantFormatDescription(format),
      icon: FORMAT_ICON_MAP[format] || Store,
      color: FORMAT_COLOR_MAP[format] || 'from-orange-500 to-red-500',
    }))
  }, [restaurantFormats])

  return (
    <OptionSelector
      title="Выберите формат ресторана"
      description="Укажите тип вашего заведения"
      options={options}
      selectedValue={selectedFormat}
      onSelect={onSelectFormat}
      onContinue={onContinue}
      onBack={onBack}
      isLoading={isLoading}
      isFetching={isFetching}
      continueButtonAriaLabel="Продолжить выбор формата ресторана"
      hintMessage="Вы можете изменить формат ресторана позже в настройках профиля"
    />
  )
})

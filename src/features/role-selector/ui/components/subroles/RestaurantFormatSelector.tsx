/**
 * Компонент формы ресторана с полями: название, тип заведения, город
 */

import { memo } from 'react'
import { FormScreen } from './shared/FormScreen'
import { useFormSelector } from '../../../model/useFormSelector'
import { LoadingState } from './shared/LoadingState'
import { getRestaurantFormatLabel } from '@/constants/labels'
import type { FormData } from '../../../model/useFormSelector'

interface RestaurantFormatSelectorProps {
  onContinue: (formData: FormData) => Promise<boolean> | void
  onBack: () => void
  restaurantFormats?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

export const RestaurantFormatSelector = memo(function RestaurantFormatSelector({
  onContinue,
  onBack,
  restaurantFormats,
  isLoading = false,
  isFetching = false,
}: RestaurantFormatSelectorProps) {
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useFormSelector({
    onContinue,
  })

  if (isLoading || isFetching) {
    return <LoadingState message="Загрузка форматов ресторанов..." />
  }

  if (!isLoading && !isFetching && (!restaurantFormats || restaurantFormats.length === 0)) {
    return <LoadingState message="Не удалось загрузить форматы ресторанов" />
  }

  return (
    <FormScreen
      title="Информация о ресторане"
      description="Заполните данные о вашем заведении"
      nameLabel="Название ресторана"
      namePlaceholder="Введите название"
      typeLabel="Тип заведения"
      types={restaurantFormats || []}
      getTypeLabel={getRestaurantFormatLabel}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
      continueButtonAriaLabel="Продолжить заполнение формы ресторана"
    />
  )
})

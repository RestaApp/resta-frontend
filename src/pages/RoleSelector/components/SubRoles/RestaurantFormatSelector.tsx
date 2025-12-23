/**
 * Компонент формы ресторана с полями: название, тип заведения, город
 */

import { memo } from 'react'
import { RestaurantFormScreen } from './components/RestaurantFormScreen'
import { useRestaurantFormSelector } from './hooks/useRestaurantFormSelector'
import { LoadingState } from './components/LoadingState'
import type { JSX } from 'react'
import type { RestaurantFormData } from './hooks/useRestaurantFormSelector'

interface RestaurantFormatSelectorProps {
  onSelectFormat: (formatValue: string) => void
  selectedFormat: string | null
  onContinue: (formData: RestaurantFormData) => Promise<boolean> | void
  onBack: () => void
  restaurantFormats?: string[]
  isLoading?: boolean
  isFetching?: boolean
  errorDialogOpen?: boolean
}

export const RestaurantFormatSelector = memo(function RestaurantFormatSelector({
  onContinue,
  onBack,
  restaurantFormats,
  isLoading = false,
  isFetching = false,
}: RestaurantFormatSelectorProps): JSX.Element {
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useRestaurantFormSelector({
    restaurantFormats,
    onContinue,
    onBack,
  })

  if (isLoading || isFetching) {
    return <LoadingState message="Загрузка форматов ресторанов..." />
  }

  if (!isLoading && !isFetching && (!restaurantFormats || restaurantFormats.length === 0)) {
    return <LoadingState message="Не удалось загрузить форматы ресторанов" />
  }

  return (
    <RestaurantFormScreen
      restaurantFormats={restaurantFormats || []}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
    />
  )
})

/**
 * Компонент формы ресторана с полями: название, тип заведения, город
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormScreen } from './shared/FormScreen'
import { useFormSelector } from '../../../model/useFormSelector'
import { LoadingState } from './shared/LoadingState'
import { useLabels } from '@/shared/i18n/hooks'
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
  const { t } = useTranslation()
  const { getRestaurantFormatLabel } = useLabels()
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useFormSelector({
    onContinue,
    skipNameValidation: true,
    skipCityValidation: true,
  })

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!isLoading && !isFetching && (!restaurantFormats || restaurantFormats.length === 0)) {
    return <LoadingState message={t('roles.restaurantFormatsError')} />
  }

  return (
    <FormScreen
      title={t('roles.venueInfoTitle')}
      description={t('roles.venueInfoDescription')}
      nameLabel={t('roles.venueNameLabel')}
      namePlaceholder={t('roles.venueNamePlaceholder')}
      typeLabel={t('roles.venueTypeLabel')}
      types={restaurantFormats || []}
      getTypeLabel={getRestaurantFormatLabel}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
      continueButtonAriaLabel={t('common.continueFormVenue')}
      step={3}
      totalSteps={3}
      hideName
      hideCity
      footerCard={
        <div className="rounded-md border border-success/30 bg-success-soft px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="text-sm leading-none text-success" aria-hidden>
              ✓
            </span>
            <p className="text-xs leading-[1.45] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t('roles.venueDirectTitle', { defaultValue: 'DIRECT-режим включён.' })}
              </span>{' '}
              {t('roles.venueDirectText', {
                defaultValue: 'Ты платишь сотрудникам напрямую. Resta не берёт комиссии.',
              })}
            </p>
          </div>
        </div>
      }
    />
  )
})

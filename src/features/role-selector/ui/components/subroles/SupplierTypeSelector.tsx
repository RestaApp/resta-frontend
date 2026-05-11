/**
 * Компонент формы поставщика с полями: название компании, категория товаров, город
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormScreen } from './shared/FormScreen'
import { useFormSelector } from '../../../model/useFormSelector'
import { LoadingState } from './shared/LoadingState'
import { useLabels } from '@/shared/i18n/hooks'
import type { FormData } from '../../../model/useFormSelector'

interface SupplierTypeSelectorProps {
  onContinue: (formData: FormData) => Promise<boolean> | void
  onBack: () => void
  supplierTypes?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

export const SupplierTypeSelector = memo(function SupplierTypeSelector({
  onContinue,
  onBack,
  supplierTypes,
  isLoading = false,
  isFetching = false,
}: SupplierTypeSelectorProps) {
  const { t } = useTranslation()
  const { getSupplierTypeLabel } = useLabels()
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useFormSelector({
    onContinue,
    multiType: true,
  })

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!isLoading && !isFetching && (!supplierTypes || supplierTypes.length === 0)) {
    return <LoadingState message={t('roles.supplierTypesError')} />
  }

  return (
    <FormScreen
      title={t('roles.supplierInfoTitle')}
      description={t('roles.supplierInfoDescription')}
      nameLabel={t('roles.supplierNameLabel')}
      namePlaceholder={t('roles.supplierNamePlaceholder')}
      typeLabel={t('roles.supplierTypeLabel')}
      types={supplierTypes || []}
      getTypeLabel={getSupplierTypeLabel}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
      continueButtonAriaLabel={t('common.continueFormSupplier')}
      isMultiType={true}
      step={2}
      totalSteps={2}
      footerCard={
        <div className="rounded-[12px] border border-[#7E5BD44D] bg-[#7E5BD40F] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="text-[14px] leading-none text-[#7E5BD4]" aria-hidden>
              📋
            </span>
            <p className="text-[11px] leading-[1.45] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t('roles.supplierLaterTitle', {
                  defaultValue: 'Прайс можно загрузить позже.',
                })}
              </span>{' '}
              {t('roles.supplierLaterText', {
                defaultValue:
                  'Сейчас покажем рестораны, которым нужны твои категории.',
              })}
            </p>
          </div>
        </div>
      }
    />
  )
})

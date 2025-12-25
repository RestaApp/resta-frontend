/**
 * Компонент формы поставщика с полями: название компании, категория товаров, город
 */

import { memo } from 'react'
import { FormScreen } from './components/FormScreen'
import { useFormSelector } from './hooks/useFormSelector'
import { LoadingState } from './components/LoadingState'
import { getSupplierTypeLabel } from '../../../../constants/labels'
 
import type { FormData } from './hooks/useFormSelector'

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
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useFormSelector({
    onContinue,
    onBack,
  })

  if (isLoading || isFetching) {
    return <LoadingState message="Загрузка типов поставщиков..." />
  }

  if (!isLoading && !isFetching && (!supplierTypes || supplierTypes.length === 0)) {
    return <LoadingState message="Не удалось загрузить типы поставщиков" />
  }

  return (
    <FormScreen
      title="Информация о поставщике"
      description="Заполните данные о вашей компании"
      nameLabel="Название компании"
      namePlaceholder="Введите название компании"
      typeLabel="Категория товаров"
      types={supplierTypes || []}
      getTypeLabel={getSupplierTypeLabel}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
      continueButtonAriaLabel="Продолжить заполнение формы поставщика"
    />
  )
})

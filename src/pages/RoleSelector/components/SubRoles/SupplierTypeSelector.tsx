/**
 * Компонент формы поставщика с полями: название компании, категория товаров, город
 */

import { memo } from 'react'
import { SupplierFormScreen } from './components/SupplierFormScreen'
import { useSupplierFormSelector } from './hooks/useSupplierFormSelector'
import { LoadingState } from './components/LoadingState'
import type { JSX } from 'react'
import type { SupplierFormData } from './hooks/useSupplierFormSelector'

interface SupplierTypeSelectorProps {
  onSelectType: (typeValue: string) => void
  selectedType: string | null
  onContinue: (formData: SupplierFormData) => Promise<boolean> | void
  onBack: () => void
  supplierTypes?: string[]
  isLoading?: boolean
  isFetching?: boolean
  errorDialogOpen?: boolean
}

export const SupplierTypeSelector = memo(function SupplierTypeSelector({
  onContinue,
  onBack,
  supplierTypes,
  isLoading = false,
  isFetching = false,
}: SupplierTypeSelectorProps): JSX.Element {
  const {
    formData,
    isLoadingLocation,
    handleLocationRequest,
    handleFormDataUpdate,
    handleContinue,
  } = useSupplierFormSelector({
    supplierTypes,
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
    <SupplierFormScreen
      supplierTypes={supplierTypes || []}
      formData={formData}
      onFormDataUpdate={handleFormDataUpdate}
      onLocationRequest={handleLocationRequest}
      onContinue={handleContinue}
      onBack={onBack}
      isLoadingLocation={isLoadingLocation}
    />
  )
})

/**
 * Компонент выбора подроли сотрудника с дополнительной информацией
 */

import { memo } from 'react'
import { useEmployeeSubRoleSelector } from '../../../model/useEmployeeSubRoleSelector'
import { PositionSelectionScreen } from './PositionSelectionScreen'
import { SpecializationDrawer } from './SpecializationDrawer'
import { LoadingState } from '../shared/LoadingState'
import type { EmployeeRole } from '@/shared/types/roles.types'
import type { EmployeeFormData } from '../../../model/useEmployeeSubRoleSelector'

interface EmployeeSubRoleSelectorProps {
  onSelectSubRole: (role: EmployeeRole, positionValue: string) => void
  selectedSubRole: EmployeeRole | null
  onContinue: (formData: EmployeeFormData) => Promise<boolean> | void
  onBack: () => void
  employeeSubRoles?: string[]
  isLoading?: boolean
  isFetching?: boolean
  errorDialogOpen?: boolean
}

export const EmployeeSubRoleSelector = memo(function EmployeeSubRoleSelector({
  onSelectSubRole,
  selectedSubRole,
  onContinue,
  onBack,
  employeeSubRoles,
  isLoading = false,
  isFetching = false,
  errorDialogOpen = false,
}: EmployeeSubRoleSelectorProps) {
  const {
    subRoles,
    formData,
    showSpecializationDrawer,
    selectedSpecializations,
    drawerSpecializations,
    isLoadingDrawerSpecs,
    drawerTitle,
    isLoadingLocation,
    handlePositionSelect,
    handleSpecializationToggle,
    handleLocationRequest,
    handleSpecializationDone,
    updateFormData,
    setShowSpecializationDrawer,
  } = useEmployeeSubRoleSelector({
    employeeSubRoles,
    selectedSubRole,
    onSelectSubRole,
    onBack,
    onContinue,
  })

  if (isLoading || isFetching) {
    return <LoadingState message="Загрузка позиций..." />
  }

  if (!isLoading && !isFetching && subRoles.length === 0) {
    return <LoadingState message="Не удалось загрузить позиции" />
  }

  return (
    <>
      <PositionSelectionScreen
        subRoles={subRoles}
        selectedSubRole={selectedSubRole}
        onPositionSelect={handlePositionSelect}
      />

      <SpecializationDrawer
        open={showSpecializationDrawer}
        onOpenChange={setShowSpecializationDrawer}
        title={drawerTitle}
        specializations={drawerSpecializations}
        isLoading={isLoadingDrawerSpecs}
        isLoadingLocation={isLoadingLocation}
        selectedSpecializations={selectedSpecializations}
        formData={formData}
        onSpecializationToggle={handleSpecializationToggle}
        onLocationRequest={handleLocationRequest}
        onFormDataUpdate={updateFormData}
        onDone={handleSpecializationDone}
        errorDialogOpen={errorDialogOpen}
      />
    </>
  )
})

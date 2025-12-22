/**
 * Компонент выбора подроли сотрудника с дополнительной информацией
 */

import { memo } from 'react'
import { useEmployeeSubRoleSelector } from './hooks/useEmployeeSubRoleSelector'
import { PositionSelectionScreen } from './components/PositionSelectionScreen'
import { SpecializationDrawer } from './components/SpecializationDrawer'
import { LoadingState } from './components/LoadingState'
import type { EmployeeRole, UserRole } from '../../../../types'
import type { JSX } from 'react'

interface EmployeeSubRoleSelectorProps {
  currentRole: UserRole | null
  onSelectSubRole: (role: EmployeeRole, positionValue: string) => void
  selectedSubRole: EmployeeRole | null
  onContinue: () => void
  onBack: () => void
  employeeSubRoles?: string[]
  isLoading?: boolean
  isFetching?: boolean
}

export const EmployeeSubRoleSelector = memo(function EmployeeSubRoleSelector({
  onSelectSubRole,
  selectedSubRole,
  onBack,
  employeeSubRoles,
  isLoading = false,
  isFetching = false,
}: EmployeeSubRoleSelectorProps): JSX.Element {
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
      />
    </>
  )
})

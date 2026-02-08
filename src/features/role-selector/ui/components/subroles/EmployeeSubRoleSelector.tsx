/**
 * Компонент выбора подроли сотрудника с дополнительной информацией
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeeSubRoleSelector } from '../../../model/useEmployeeSubRoleSelector'
import { PositionSelectionScreen } from './PositionSelectionScreen'
import { SpecializationDrawer } from './shared/SpecializationDrawer'
import { LoadingState } from './shared/LoadingState'
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
  const { t } = useTranslation()
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
    openSpecializationDrawer,
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
    return <LoadingState />
  }

  if (!isLoading && !isFetching && subRoles.length === 0) {
    return <LoadingState message={t('roles.positionsError')} />
  }

  return (
    <>
      <PositionSelectionScreen
        subRoles={subRoles}
        selectedSubRole={selectedSubRole}
        onPositionSelect={handlePositionSelect}
        onContinue={openSpecializationDrawer}
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

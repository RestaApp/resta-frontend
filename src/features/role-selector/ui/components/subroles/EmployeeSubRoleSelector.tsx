/**
 * Компонент выбора подроли сотрудника с дополнительной информацией
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeeSubRoleSelector } from '../../../model/useEmployeeSubRoleSelector'
import { PositionSelectionScreen } from './PositionSelectionScreen'
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
}

export const EmployeeSubRoleSelector = memo(function EmployeeSubRoleSelector({
  onSelectSubRole,
  selectedSubRole,
  onContinue,
  onBack,
  employeeSubRoles,
  isLoading = false,
  isFetching = false,
}: EmployeeSubRoleSelectorProps) {
  const { t } = useTranslation()
  const {
    subRoles,
    selectedSpecializations,
    drawerSpecializations,
    handlePositionSelect,
    handleSpecializationToggle,
    handleSpecializationDone,
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
        specializations={drawerSpecializations}
        selectedSpecializations={selectedSpecializations}
        onSpecializationToggle={handleSpecializationToggle}
        onContinue={handleSpecializationDone}
      />
    </>
  )
})

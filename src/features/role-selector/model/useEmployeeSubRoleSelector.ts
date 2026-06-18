/**
 * Хук для бизнес-логики выбора подроли сотрудника
 */

import { useState, useMemo, useCallback } from 'react'
import { useUserSpecializations } from '@/shared/lib/hooks/useUserSpecializations'
import { logger } from '@/shared/utils/logger'
import type { EmployeeRole } from '@/shared/types/roles.types'
import { mapEmployeeSubRolesFromApi } from '@/shared/utils/roleMappers'

export interface EmployeeFormData {
  specializations: string[]
}

interface UseEmployeeSubRoleSelectorProps {
  employeeSubRoles?: string[]
  onSelectSubRole: (role: EmployeeRole, positionValue: string) => void
  onContinue?: (formData: EmployeeFormData) => Promise<boolean> | void
}

export const useEmployeeSubRoleSelector = ({
  employeeSubRoles,
  onSelectSubRole,
  onContinue,
}: UseEmployeeSubRoleSelectorProps) => {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [selectedPositionValueLocal, setSelectedPositionValueLocal] = useState<string | null>(null)

  // Преобразуем данные из API в формат компонентов
  const subRoles = useMemo(() => {
    if (employeeSubRoles && employeeSubRoles.length > 0) {
      return mapEmployeeSubRolesFromApi(employeeSubRoles)
    }
    return []
  }, [employeeSubRoles])

  const { specializations: drawerSpecializations = [] } = useUserSpecializations({
    position: selectedPositionValueLocal || '',
    enabled: !!selectedPositionValueLocal,
  })

  const handlePositionSelect = useCallback(
    (role: EmployeeRole, positionValue: string) => {
      onSelectSubRole(role, positionValue)
      setSelectedPositionValueLocal(positionValue)
      setSelectedSpecializations([])
    },
    [onSelectSubRole]
  )

  const handleSpecializationToggle = useCallback((spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }, [])

  const handleSpecializationDone = useCallback(async () => {
    const finalFormData: EmployeeFormData = { specializations: selectedSpecializations }

    if (!onContinue) {
      return
    }

    try {
      await onContinue(finalFormData)
    } catch (error) {
      logger.error('Ошибка при сохранении:', error)
    }
  }, [selectedSpecializations, onContinue])

  return {
    subRoles,
    selectedSpecializations,
    drawerSpecializations,
    handlePositionSelect,
    handleSpecializationToggle,
    handleSpecializationDone,
  }
}

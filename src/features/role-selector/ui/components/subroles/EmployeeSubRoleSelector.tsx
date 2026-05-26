/**
 * Компонент выбора подроли сотрудника с дополнительной информацией
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployeeSubRoleSelector } from '../../../model/useEmployeeSubRoleSelector'
import { LoadingState } from './shared/LoadingState'
import { RoleDetailsStep } from './shared/RoleDetailsStep'
import { useLabels } from '@/shared/i18n/hooks'
import type { EmployeeRole } from '@/shared/types/roles.types'
import type { EmployeeFormData } from '../../../model/useEmployeeSubRoleSelector'

const EMOJI_BY_ROLE: Partial<Record<EmployeeRole, string>> = {
  chef: '👨‍🍳',
  waiter: '🍽',
  barista: '☕',
  bartender: '🍸',
  manager: '📋',
  support: '🎧',
  delivery: '🛵',
  cashier: '💵',
  office: '💼',
}

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
  const { getSpecializationLabel } = useLabels()
  const {
    subRoles,
    selectedSpecializations,
    drawerSpecializations,
    handlePositionSelect,
    handleSpecializationToggle,
    handleSpecializationDone,
  } = useEmployeeSubRoleSelector({
    employeeSubRoles,
    onSelectSubRole,
    onContinue,
  })

  if (isLoading || isFetching) {
    return <LoadingState />
  }

  if (!isLoading && !isFetching && subRoles.length === 0) {
    return <LoadingState message={t('roles.positionsError')} />
  }

  return (
    <RoleDetailsStep
      title={t('roles.positionScreenTitle')}
      subtitle={t('roles.positionScreenDescription')}
      groups={[
        {
          id: 'position',
          label: t('roles.positionLabel', { defaultValue: 'ПОЗИЦИЯ' }),
          values: subRoles.map(subRole => subRole.id),
          selectedValues: selectedSubRole ? [selectedSubRole] : [],
          onToggle: id => {
            const role = subRoles.find(item => item.id === id)
            if (role) handlePositionSelect(role.id, role.originalValue || role.id)
          },
          getLabel: id => {
            const role = subRoles.find(item => item.id === id)
            return `${EMOJI_BY_ROLE[id as EmployeeRole] ?? '👤'} ${role?.title ?? id}`
          },
          getAriaLabel: id => {
            const role = subRoles.find(item => item.id === id)
            return t('aria.selectType', { label: role?.title ?? id })
          },
        },
        {
          id: 'specializations',
          label: t('roles.specializationLabel'),
          hint: t('roles.specializationMultiHint'),
          values: drawerSpecializations,
          selectedValues: selectedSpecializations,
          onToggle: handleSpecializationToggle,
          getLabel: getSpecializationLabel,
          getAriaLabel: (_, label) => t('aria.selectSpecialization', { label }),
        },
      ]}
      ctaText={t('roles.continuePosition')}
      onContinue={handleSpecializationDone}
      onBack={onBack}
      canContinue={selectedSubRole !== null}
      continueButtonAriaLabel={t('common.continue')}
    />
  )
})

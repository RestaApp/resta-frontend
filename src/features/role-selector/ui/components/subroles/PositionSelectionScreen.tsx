/**
 * Экран выбора позиции сотрудника
 */

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { TagGroup } from '@/shared/ui/TagGroup'
import { OnboardingSection, OnboardingStepLayout } from '../OnboardingStepLayout'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT } from '../OnboardingBottomCta'
import type { EmployeeSubRole, EmployeeRole } from '@/shared/types/roles.types'

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

interface PositionSelectionScreenProps {
  subRoles: EmployeeSubRole[]
  selectedSubRole: string | null
  onPositionSelect: (role: EmployeeRole, positionValue: string) => void
  specializations: string[]
  selectedSpecializations: string[]
  onSpecializationToggle: (spec: string) => void
  onContinue: () => void
}

export const PositionSelectionScreen = memo(function PositionSelectionScreen({
  subRoles,
  selectedSubRole,
  onPositionSelect,
  specializations,
  selectedSpecializations,
  onSpecializationToggle,
  onContinue,
}: PositionSelectionScreenProps) {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const visibleRoles = subRoles

  const handleSelect = useCallback(
    (id: string) => {
      const role = subRoles.find(r => r.id === id)
      if (role) onPositionSelect(role.id, role.originalValue || role.id)
    },
    [subRoles, onPositionSelect]
  )

  return (
    <OnboardingStepLayout
      currentStep={3}
      totalSteps={3}
      title={t('roles.positionScreenTitle')}
      subtitle={t('roles.positionScreenDescription')}
      tone="employee"
      bottomSpace={ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT}
    >
      <OnboardingSection
        label={t('roles.positionLabel', { defaultValue: 'ПОЗИЦИЯ' })}
        className="mb-[14px]"
      >
        <TagGroup
          values={visibleRoles.map(subRole => subRole.id)}
          selectedValues={selectedSubRole ? [selectedSubRole] : []}
          onToggle={handleSelect}
          getLabel={id => {
            const subRole = visibleRoles.find(role => role.id === id)
            return `${EMOJI_BY_ROLE[id as EmployeeRole] ?? '👤'} ${subRole?.title ?? id}`
          }}
          getAriaLabel={id => {
            const subRole = visibleRoles.find(role => role.id === id)
            return t('aria.selectType', { label: subRole?.title ?? id })
          }}
          tone="employee"
          size="lg"
        />
      </OnboardingSection>

      <OnboardingSection
        label={t('roles.specializationLabel')}
        hint={t('roles.specializationMultiHint')}
      >
        <TagGroup
          values={specializations}
          selectedValues={selectedSpecializations}
          onToggle={onSpecializationToggle}
          getLabel={getSpecializationLabel}
          getAriaLabel={(_, label) => t('aria.selectSpecialization', { label })}
          tone="employee"
          size="lg"
        />
      </OnboardingSection>

      <OnboardingBottomCta
        onClick={onContinue}
        disabled={!selectedSubRole}
        tone="employee"
        showFillLaterHint
      >
        {t('roles.continuePosition')}
      </OnboardingBottomCta>
    </OnboardingStepLayout>
  )
})

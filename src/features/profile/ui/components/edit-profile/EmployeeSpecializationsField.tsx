import { memo, useCallback, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { FormField } from '@/components/ui/form-field'
import { useLabels } from '@/shared/i18n/hooks'
import { MultiSelectTagsList } from '@/shared/ui/MultiSelectTagsList'

interface EmployeeSpecializationsFieldProps {
  value: string[]
  options: string[]
  disabled: boolean
  isLoading: boolean
  error?: string
  onChange: (value: string[]) => void
  containerRef?: RefObject<HTMLDivElement | null>
}

export const EmployeeSpecializationsField = memo(function EmployeeSpecializationsField({
  value,
  options,
  disabled,
  isLoading,
  error,
  onChange,
  containerRef,
}: EmployeeSpecializationsFieldProps) {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()

  const handleToggle = useCallback(
    (specialization: string) => {
      onChange(
        value.includes(specialization)
          ? value.filter(item => item !== specialization)
          : [...value, specialization]
      )
    },
    [onChange, value]
  )

  return (
    <FormField
      label={t('roles.specializationLabel')}
      hint={t('roles.specializationMultiHint')}
      hintPlacement="label"
      required
      error={error}
      className="scroll-mt-4"
    >
      <div ref={containerRef} />
      <MultiSelectTagsList
        options={options}
        selectedValues={value}
        onToggle={handleToggle}
        getLabel={getSpecializationLabel}
        getAriaLabel={(_value, label) => t('aria.selectSpecialization', { label })}
        disabled={disabled}
        isLoading={isLoading}
        emptyMessage={t('shift.noSpecializations')}
        countLabel={count => t('shift.specializationCount', { count })}
      />
    </FormField>
  )
})

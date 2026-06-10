import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from './Field'
import { MultiSelectTagsList } from '@/shared/ui/MultiSelectTagsList'
import { useLabels } from '@/shared/i18n/hooks'
import { cn } from '@/shared/utils/cn'

interface MultiSelectSpecializationsProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  hint?: string
  hintPlacement?: 'label' | 'below'
  isLoading?: boolean
  error?: string
}

export const MultiSelectSpecializations = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  hint,
  hintPlacement = 'label',
  isLoading = false,
  error,
}: MultiSelectSpecializationsProps) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()

  const handleToggle = useCallback(
    (spec: string) => {
      onChange(value.includes(spec) ? value.filter(s => s !== spec) : [...value, spec])
    },
    [onChange, value]
  )

  return (
    <Field label={label} hint={hint} hintPlacement={hintPlacement} error={error}>
      <MultiSelectTagsList
        className={cn(error && 'rounded-lg ring-2 ring-destructive/20 p-2 -m-2')}
        options={options}
        selectedValues={value}
        onToggle={handleToggle}
        getLabel={getSpecializationLabel}
        getAriaLabel={(_value, labelText) => t('aria.selectSpecialization', { label: labelText })}
        disabled={disabled}
        isLoading={isLoading}
        emptyMessage={placeholder || t('shift.noSpecializations')}
        countLabel={count => t('shift.specializationCount', { count })}
      />
    </Field>
  )
}

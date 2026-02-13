import { useTranslation } from 'react-i18next'
import { Field } from './Field'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { Loader } from '@/components/ui/loader'
import { useLabels } from '@/shared/i18n/hooks'
import { cn } from '@/utils/cn'

interface MultiSelectSpecializationsProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  hint?: string
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
  isLoading = false,
  error,
}: MultiSelectSpecializationsProps) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const handleToggle = (spec: string) => {
    if (disabled) return
    if (value.includes(spec)) {
      onChange(value.filter(s => s !== spec))
    } else {
      onChange([...value, spec])
    }
  }

  return (
    <Field label={label} hint={hint} error={error}>
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader size="sm" />
          </div>
        ) : options.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            {placeholder || t('shift.noSpecializations')}
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-wrap gap-2',
              error && 'rounded-xl ring-2 ring-destructive/20 p-2 -m-2'
            )}
          >
            {options.map(spec => (
              <SelectableTagButton
                key={spec}
                value={spec}
                label={getSpecializationLabel(spec)}
                isSelected={value.includes(spec)}
                onClick={handleToggle}
                disabled={disabled}
                ariaLabel={t('aria.selectSpecialization', { label: getSpecializationLabel(spec) })}
              />
            ))}
          </div>
        )}
        {value.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {t('shift.specializationCount', { count: value.length })}
          </div>
        )}
      </div>
    </Field>
  )
}

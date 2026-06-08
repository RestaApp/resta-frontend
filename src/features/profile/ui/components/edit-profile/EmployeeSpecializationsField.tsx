import { memo, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { FormField } from '@/components/ui/form-field'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/shared/utils/cn'

interface EmployeeSpecializationsFieldProps {
  value: string[]
  options: string[]
  disabled: boolean
  isLoading: boolean
  onChange: (value: string[]) => void
  containerRef?: RefObject<HTMLDivElement | null>
}

export const EmployeeSpecializationsField = memo(function EmployeeSpecializationsField({
  value,
  options,
  disabled,
  isLoading,
  onChange,
  containerRef,
}: EmployeeSpecializationsFieldProps) {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()

  const handleToggle = (specialization: string) => {
    if (disabled) return

    onChange(
      value.includes(specialization)
        ? value.filter(item => item !== specialization)
        : [...value, specialization]
    )
  }

  return (
    <FormField
      label={t('roles.specializationLabel')}
      hint={t('roles.specializationMultiHint')}
      className="scroll-mt-4"
    >
      <div ref={containerRef} />
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader size="sm" />
          </div>
        ) : options.length === 0 ? (
          <div className="py-2 text-sm text-muted-foreground">{t('shift.noSpecializations')}</div>
        ) : (
          <div className={cn('flex flex-wrap gap-2')}>
            {options.map(specialization => {
              const label = getSpecializationLabel(specialization)
              return (
                <SelectableTagButton
                  key={specialization}
                  value={specialization}
                  label={label}
                  isSelected={value.includes(specialization)}
                  onClick={handleToggle}
                  disabled={disabled}
                  ariaLabel={t('aria.selectSpecialization', { label })}
                />
              )
            })}
          </div>
        )}

        {value.length > 0 ? (
          <div className="text-xs text-muted-foreground">
            {t('shift.specializationCount', { count: value.length })}
          </div>
        ) : null}
      </div>
    </FormField>
  )
})

import { memo, useCallback, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { FormField } from '@/components/ui/form-field'
import { MultiSelectTagsList } from '@/shared/ui/MultiSelectTagsList'
import { useLabels } from '@/shared/i18n/hooks'

interface SupplierTypesFieldProps {
  options: string[]
  isLoading: boolean
  selected: string[]
  disabled: boolean
  containerRef?: RefObject<HTMLDivElement | null>
  onChange: (next: string[]) => void
}

/** Поле выбора типов поставщика (multi‑select chip‑группа). */
export const SupplierTypesField = memo(function SupplierTypesField({
  options,
  isLoading,
  selected,
  disabled,
  containerRef,
  onChange,
}: SupplierTypesFieldProps) {
  const { t } = useTranslation()
  const { getSupplierTypeLabel } = useLabels()

  const handleToggle = useCallback(
    (type: string) => {
      onChange(
        selected.includes(type) ? selected.filter(item => item !== type) : [...selected, type]
      )
    },
    [onChange, selected]
  )

  return (
    <FormField
      label={t('profile.supplierTypesLabel', { defaultValue: 'Типы поставщика' })}
      hint={t('profile.supplierTypesHint', {
        defaultValue: 'Можно выбрать несколько направлений',
      })}
      className="scroll-mt-4"
    >
      <div ref={containerRef} />
      <MultiSelectTagsList
        options={options}
        selectedValues={selected}
        onToggle={handleToggle}
        getLabel={getSupplierTypeLabel}
        getAriaLabel={(_value, label) => t('aria.selectType', { label })}
        disabled={disabled}
        isLoading={isLoading}
        emptyMessage={t('profile.supplierTypesEmpty', {
          defaultValue: 'Нет доступных типов для выбранной категории',
        })}
        countLabel={count =>
          t('profile.supplierTypesCount', {
            defaultValue: 'Выбрано: {{count}}',
            count,
          })
        }
      />
    </FormField>
  )
})

SupplierTypesField.displayName = 'SupplierTypesField'

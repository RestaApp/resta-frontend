import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { useLabels } from '@/shared/i18n/hooks'

interface SupplierTypesFieldProps {
  options: string[]
  isLoading: boolean
  selected: string[]
  disabled: boolean
  onChange: (next: string[]) => void
}

/**
 * Поле выбора типов поставщика (multi‑select chip‑группа).
 * SRP: только эта фича; не знает про остальную форму.
 */
export const SupplierTypesField = memo(
  ({ options, isLoading, selected, disabled, onChange }: SupplierTypesFieldProps) => {
    const { t } = useTranslation()
    const { getSupplierTypeLabel } = useLabels()

    return (
      <FormField
        label={t('profile.supplierTypesLabel', { defaultValue: 'Типы поставщика' })}
        hint={t('profile.supplierTypesHint', {
          defaultValue: 'Можно выбрать несколько направлений',
        })}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader size="sm" />
          </div>
        ) : options.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            {t('profile.supplierTypesEmpty', {
              defaultValue: 'Нет доступных типов для выбранной категории',
            })}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {options.map(type => (
                <SelectableTagButton
                  key={type}
                  value={type}
                  label={getSupplierTypeLabel(type)}
                  isSelected={selected.includes(type)}
                  onClick={value =>
                    onChange(
                      selected.includes(value)
                        ? selected.filter(item => item !== value)
                        : [...selected, value]
                    )
                  }
                  disabled={disabled}
                  ariaLabel={t('aria.selectType', { label: getSupplierTypeLabel(type) })}
                />
              ))}
            </div>
            {selected.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                {t('profile.supplierTypesCount', {
                  defaultValue: 'Выбрано: {{count}}',
                  count: selected.length,
                })}
              </div>
            )}
          </>
        )}
      </FormField>
    )
  }
)
SupplierTypesField.displayName = 'SupplierTypesField'

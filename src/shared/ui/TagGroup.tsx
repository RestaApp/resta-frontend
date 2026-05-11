import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectableTagButton } from './SelectableTagButton'

type TagTone = 'primary' | 'employee' | 'restaurant' | 'supplier'

interface TagGroupProps {
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
  getAriaLabel?: (value: string, label: string) => string
  tone?: TagTone
}

export const TagGroup = memo(function TagGroup({
  values,
  selectedValues,
  onToggle,
  getLabel,
  getAriaLabel,
  tone = 'primary',
}: TagGroupProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-2">
      {values.map(value => {
        const label = getLabel(value)
        return (
          <SelectableTagButton
            key={value}
            value={value}
            label={label}
            tone={tone}
            isSelected={selectedValues.includes(value)}
            onClick={onToggle}
            ariaLabel={getAriaLabel?.(value, label) ?? t('aria.selectType', { label })}
          />
        )
      })}
    </div>
  )
})

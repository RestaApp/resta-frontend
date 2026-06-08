import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { SelectableTagButton } from './SelectableTagButton'

type TagSize = 'md' | 'lg'

interface TagGroupProps {
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
  getIcon?: (value: string) => LucideIcon | undefined
  getAriaLabel?: (value: string, label: string) => string
  size?: TagSize
}

export const TagGroup = memo(function TagGroup({
  values,
  selectedValues,
  onToggle,
  getLabel,
  getIcon,
  getAriaLabel,
  size = 'md',
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
            icon={getIcon?.(value)}
            size={size}
            isSelected={selectedValues.includes(value)}
            onClick={onToggle}
            ariaLabel={getAriaLabel?.(value, label) ?? t('aria.selectType', { label })}
          />
        )
      })}
    </div>
  )
})

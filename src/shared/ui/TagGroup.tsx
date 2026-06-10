import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { ExpandableTagList } from './ExpandableTagList'
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
  /** Сворачивание длинных списков — только для специализаций. */
  expandable?: boolean
}

export const TagGroup = memo(function TagGroup({
  values,
  selectedValues,
  onToggle,
  getLabel,
  getIcon,
  getAriaLabel,
  size = 'md',
  expandable = false,
}: TagGroupProps) {
  const { t } = useTranslation()

  const renderItem = (value: string) => {
    const label = getLabel(value)
    return (
      <SelectableTagButton
        value={value}
        label={label}
        icon={getIcon?.(value)}
        size={size}
        isSelected={selectedValues.includes(value)}
        onClick={onToggle}
        ariaLabel={getAriaLabel?.(value, label) ?? t('aria.selectType', { label })}
      />
    )
  }

  if (!expandable) {
    return (
      <div className="flex flex-wrap gap-2">
        {values.map(value => (
          <span key={value} className="contents">
            {renderItem(value)}
          </span>
        ))}
      </div>
    )
  }

  return (
    <ExpandableTagList
      items={values}
      getKey={value => value}
      priorityKeys={selectedValues}
      renderItem={renderItem}
    />
  )
})

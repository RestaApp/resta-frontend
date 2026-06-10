import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MultiSelectTagsList } from './MultiSelectTagsList'

type TagSize = 'md' | 'lg'

interface TagGroupProps {
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
  getIcon?: (value: string) => LucideIcon | undefined
  getAriaLabel?: (value: string, label: string) => string
  disabled?: boolean
  size?: TagSize
}

export const TagGroup = memo(function TagGroup({
  values,
  selectedValues,
  onToggle,
  getLabel,
  getIcon,
  getAriaLabel,
  disabled = false,
  size = 'md',
}: TagGroupProps) {
  return (
    <MultiSelectTagsList
      options={values}
      selectedValues={selectedValues}
      onToggle={onToggle}
      getLabel={getLabel}
      getIcon={getIcon}
      getAriaLabel={getAriaLabel}
      disabled={disabled}
      size={size}
    />
  )
})

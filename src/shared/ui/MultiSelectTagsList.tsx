import { memo, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { ExpandableTagList } from '@/shared/ui/ExpandableTagList'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'

type TagSize = 'md' | 'lg'

export interface MultiSelectTagsListProps {
  options: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
  getAriaLabel?: (value: string, label: string) => string
  getIcon?: (value: string) => LucideIcon | undefined
  disabled?: boolean
  isLoading?: boolean
  emptyMessage?: ReactNode
  countLabel?: (count: number) => string
  className?: string
  size?: TagSize
}

export const MultiSelectTagsList = memo(function MultiSelectTagsList({
  options,
  selectedValues,
  onToggle,
  getLabel,
  getAriaLabel,
  getIcon,
  disabled = false,
  isLoading = false,
  emptyMessage,
  countLabel,
  className,
  size = 'md',
}: MultiSelectTagsListProps) {
  const handleToggle = (value: string) => {
    if (disabled) return
    onToggle(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader size="sm" />
      </div>
    )
  }

  if (options.length === 0) {
    return emptyMessage ? (
      <div className="py-2 text-sm text-muted-foreground">{emptyMessage}</div>
    ) : null
  }

  return (
    <div className="flex flex-col gap-3">
      <ExpandableTagList
        className={className}
        items={options}
        getKey={value => value}
        priorityKeys={selectedValues}
        renderItem={value => {
          const label = getLabel(value)
          return (
            <SelectableTagButton
              value={value}
              label={label}
              icon={getIcon?.(value)}
              size={size}
              isSelected={selectedValues.includes(value)}
              onClick={handleToggle}
              disabled={disabled}
              ariaLabel={getAriaLabel?.(value, label)}
            />
          )
        }}
      />

      {countLabel && selectedValues.length > 0 ? (
        <div className="text-xs text-muted-foreground">{countLabel(selectedValues.length)}</div>
      ) : null}
    </div>
  )
})

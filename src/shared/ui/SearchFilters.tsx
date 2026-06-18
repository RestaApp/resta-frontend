import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { FilterChip } from '@/shared/ui/FilterChip'

interface SearchFiltersProps {
  activeFilters: ActiveFilterItem[]
  onResetFilters: () => void
  onRemoveFilter?: (id: string) => void
}

function SearchFiltersComponent({
  activeFilters,
  onResetFilters,
  onRemoveFilter,
}: SearchFiltersProps) {
  const { t } = useTranslation()

  if (activeFilters.length === 0) return null

  return (
    <div className="border-b border-border bg-background ui-density-page py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {activeFilters.map(filter => (
          <FilterChip
            key={filter.id}
            {...filter}
            onRemove={onRemoveFilter ? () => onRemoveFilter(filter.id) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={onResetFilters}
          className={cn(
            'inline-flex shrink-0 items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
          )}
        >
          {t('feed.resetAllFilters')}
        </button>
      </div>
    </div>
  )
}

const areFiltersEqual = (prev: ActiveFilterItem[], next: ActiveFilterItem[]) => {
  if (prev.length !== next.length) return false
  return prev.every((filter, index) => {
    const other = next[index]
    if (!other) return false
    return (
      filter.id === other.id && filter.label === other.label && filter.variant === other.variant
    )
  })
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
  return (
    areFiltersEqual(prevProps.activeFilters, nextProps.activeFilters) &&
    prevProps.onResetFilters === nextProps.onResetFilters &&
    prevProps.onRemoveFilter === nextProps.onRemoveFilter
  )
})

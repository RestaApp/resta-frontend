import { memo } from 'react'
import { Badge } from '@/components/ui/badge'

interface SearchFiltersProps {
  activeFiltersList: string[]
}

function SearchFiltersComponent({ activeFiltersList }: SearchFiltersProps) {
  if (activeFiltersList.length === 0) return null

  return (
    <div className="px-4 py-2 bg-card border-b border-border">
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex gap-1.5 items-center overflow-x-auto scrollbar-hide">
          {activeFiltersList.map((filter, index) => (
            <Badge key={index} variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
  return prevProps.activeFiltersList.join('|') === nextProps.activeFiltersList.join('|')
})

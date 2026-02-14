import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SearchFiltersProps {
  activeFiltersList: string[]
  onResetFilters: () => void
}

function SearchFiltersComponent({ activeFiltersList, onResetFilters }: SearchFiltersProps) {
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
        <Button
          onClick={onResetFilters}
          variant="ghost"
          size="sm"
          aria-label="Сбросить фильтры"
          className="rounded-full p-2 min-w-[32px] h-8 w-8 shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
  return prevProps.activeFiltersList.join('|') === nextProps.activeFiltersList.join('|')
})

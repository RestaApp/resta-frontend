import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SearchFiltersProps {
  activeFiltersList: string[]
  onResetFilters: () => void
}

function SearchFiltersComponent({ activeFiltersList, onResetFilters }: SearchFiltersProps) {
  const { t } = useTranslation()

  if (activeFiltersList.length === 0) return null

  return (
    <div className="ui-density-page flex items-center gap-1.5 border-b border-border/70 bg-background py-1">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto scrollbar-hide">
        {activeFiltersList.map((filter, index) => (
          <Badge
            key={index}
            variant="tag"
            className="shrink-0 whitespace-nowrap px-2 py-0 text-[11px] leading-tight"
          >
            {filter}
          </Badge>
        ))}
      </div>
      <Button
        onClick={onResetFilters}
        variant="ghost"
        size="sm"
        aria-label={t('feed.resetFiltersAria')}
        className="h-8 w-8 min-h-8 min-w-8 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3 shrink-0" aria-hidden />
      </Button>
    </div>
  )
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
  return prevProps.activeFiltersList.join('|') === nextProps.activeFiltersList.join('|')
})

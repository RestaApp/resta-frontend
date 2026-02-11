import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SearchFiltersProps {
  onOpenFilters?: () => void
  isLoading?: boolean
  hasActiveAdvancedFilters?: boolean
  activeFiltersList: string[]
}

function SearchFiltersComponent({
  onOpenFilters,
  isLoading = false,
  hasActiveAdvancedFilters = false,
  activeFiltersList,
}: SearchFiltersProps) {
  const { t } = useTranslation()
  return (
    <div className="px-4 py-2 bg-card border-b border-border">
      <div className="flex gap-2 items-center">
        {activeFiltersList.length > 0 && (
          <div className="flex-1 flex gap-1.5 items-center overflow-x-auto scrollbar-hide">
            {activeFiltersList.map((filter, index) => (
              <Badge key={index} variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                {filter}
              </Badge>
            ))}
          </div>
        )}

        {/* Кнопка фильтра справа */}
        {onOpenFilters && (
          <div className="relative ml-auto flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFilters}
              aria-label={t('feed.openFilters')}
              className="w-10 h-10 p-0"
            >
              <SlidersHorizontal
                className={`w-5 h-5 ${hasActiveAdvancedFilters ? 'text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            {hasActiveAdvancedFilters && !isLoading && (
              <span className="absolute -top-1 -right-1 w-4 h-4 gradient-primary rounded-full border-2 border-background shadow-lg" />
            )}
            {isLoading && (
              <Loader2 className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-spin" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
  // Сравниваем только важные пропсы для обновления
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.hasActiveAdvancedFilters === nextProps.hasActiveAdvancedFilters &&
    prevProps.activeFiltersList.join('|') === nextProps.activeFiltersList.join('|')
  )
})

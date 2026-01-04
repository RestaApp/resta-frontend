import { memo } from 'react'
import { SlidersHorizontal, Loader2 } from 'lucide-react'

interface SearchFiltersProps {
    onOpenFilters?: () => void
    isLoading?: boolean
    hasActiveFilters?: boolean
}

function SearchFiltersComponent({
    onOpenFilters,
    isLoading = false,
    hasActiveFilters = false
}: SearchFiltersProps) {
    return (
        <div className="px-4 py-2 bg-card border-b border-border">
            <div className="flex gap-2 justify-end">
                {onOpenFilters && (
                    <button
                        onClick={onOpenFilters}
                        aria-label="Открыть фильтры"
                        className="relative p-2 bg-card/60 rounded-xl hover:bg-card transition-colors border border-border"
                    >
                        <div className="relative">
                            <SlidersHorizontal className={`w-5 h-5 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`} />
                            {hasActiveFilters && (
                                <span
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full border-2 border-background shadow-lg"
                                    style={{ zIndex: 10 }}
                                />
                            )}
                            {isLoading && (
                                <Loader2 className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-spin" />
                            )}
                        </div>
                    </button>
                )}
            </div>
        </div>
    )
}

export const SearchFilters = memo(SearchFiltersComponent, (prevProps, nextProps) => {
    // Сравниваем только важные пропсы для обновления
    return (
        prevProps.isLoading === nextProps.isLoading &&
        prevProps.hasActiveFilters === nextProps.hasActiveFilters
    )
})



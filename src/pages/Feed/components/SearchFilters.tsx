import { memo } from 'react'
import { SlidersHorizontal, Loader2 } from 'lucide-react'

interface SearchFiltersProps {
    onOpenFilters?: () => void
    isLoading?: boolean
    hasActiveFilters?: boolean
    activeFiltersList: string[]
}

function SearchFiltersComponent({
    onOpenFilters,
    isLoading = false,
    hasActiveFilters = false,
    activeFiltersList,
}: SearchFiltersProps) {
    return (
        <div className="px-4 py-2 bg-card border-b border-border">
            <div className="flex gap-2 items-center">
                {/* Активные фильтры слева */}
                {activeFiltersList.length > 0 && (
                    <div className="flex-1 flex gap-1.5 items-center overflow-x-auto scrollbar-hide">
                        {activeFiltersList.map((filter, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg whitespace-nowrap flex-shrink-0"
                            >
                                {filter}
                            </span>
                        ))}
                    </div>
                )}

                {/* Кнопка фильтра справа */}
                {onOpenFilters && (
                    <button
                        onClick={onOpenFilters}
                        aria-label="Открыть фильтры"
                        className="relative p-2 bg-card/60 rounded-xl hover:bg-card transition-colors border border-border flex-shrink-0 ml-auto"
                    >
                        <div className="relative">
                            <SlidersHorizontal className={`w-5 h-5 ${hasActiveFilters ? 'text-primary' : 'text-muted-foreground'}`} />
                            {hasActiveFilters && !isLoading && (
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
        prevProps.hasActiveFilters === nextProps.hasActiveFilters &&
        prevProps.activeFiltersList.join('|') === nextProps.activeFiltersList.join('|')
    )
})


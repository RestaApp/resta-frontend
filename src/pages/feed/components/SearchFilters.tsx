import { memo } from 'react'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'

interface SearchFiltersProps {
    query: string
    onQueryChange: (q: string) => void
    onOpenFilters?: () => void
    isLoading?: boolean
}

export const SearchFilters = memo(function SearchFilters({
    query,
    onQueryChange,
    onOpenFilters,
    isLoading = false
}: SearchFiltersProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onQueryChange('')
        }
    }

    return (
        <div className="px-4 py-2 bg-card border-b border-border">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                    )}
                    <input
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="text"
                        placeholder="Поиск по названию..."
                        className={`w-full pl-10 ${isLoading ? 'pr-10' : 'pr-4'} py-2 bg-card/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                    />
                </div>
                {onOpenFilters && (
                    <button
                        onClick={onOpenFilters}
                        aria-label="Открыть фильтры"
                        className="p-2 bg-card/60 rounded-xl hover:bg-card transition-colors border border-border"
                    >
                        <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                    </button>
                )}
            </div>
        </div>
    )
})



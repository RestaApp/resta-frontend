import { Search, SlidersHorizontal } from 'lucide-react'

interface SearchFiltersProps {
    query: string
    onQueryChange: (q: string) => void
}

export const SearchFilters = ({ query, onQueryChange }: SearchFiltersProps => {
    return (
        <div className="px-4 py-2 bg-card border-b border-border">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                        type="text"
                        placeholder="Поиск по названию..."
                        className="w-full pl-10 pr-4 py-2 bg-card/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <button className="p-2 bg-card/60 rounded-xl hover:bg-card transition-colors border border-border">
                    <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>
        </div>
    )
}



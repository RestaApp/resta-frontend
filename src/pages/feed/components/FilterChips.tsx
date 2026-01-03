import { Filter } from 'lucide-react'
 

interface FilterOption {
    id: string
    label: string
    icon?: string
}

interface FilterChipsProps {
    activeFilter: string
    onFilterChange: (id: string) => void
    onOpenAdvanced: () => void
}

const QUICK_FILTERS: FilterOption[] = [
    { id: 'all', label: 'Все' },
    { id: 'urgent', label: '🔥 Срочно' },
    { id: 'high_pay', label: '💰 Высокая ставка' },
    { id: 'nearby', label: '📍 Рядом' },
    { id: 'my_role', label: '👨‍🍳 Для меня' },
]

export const FilterChips = ({ activeFilter, onFilterChange, onOpenAdvanced }: FilterChipsProps) => {
    return (
        <div className="flex items-center gap-2 pl-4 pr-4 py-2 overflow-x-auto scrollbar-hide no-scrollbar">
            {/* Кнопка открытия полных фильтров */}
            <button
                onClick={onOpenAdvanced}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-secondary/80 text-foreground border border-border active:scale-95 transition-transform"
                aria-label="Расширенные фильтры"
            >
                <Filter size={18} />
            </button>

            <div className="w-[1px] h-6 bg-border mx-1 flex-shrink-0" />

            {/* Горизонтальный список чипов */}
            {QUICK_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id
                return (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                            flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border
                            ${isActive
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-purple-500/20'
                                : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                            }
                        `}
                    >
                        {filter.label}
                    </button>
                )
            })}
        </div>
    )
}


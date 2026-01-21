import { ChefHat } from 'lucide-react'


interface EmptyStateProps {
    message?: string
    onReset?: () => void
    showResetButton?: boolean
}

export const EmptyState = ({
    message = 'Смены не найдены',
    onReset,
    showResetButton = false
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-muted-foreground text-center mb-4">{message}</p>
            {showResetButton && onReset && (
                <button
                    onClick={onReset}
                    className="px-6 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition-colors"
                >
                    Сбросить фильтры
                </button>
            )}
        </div>
    )
}


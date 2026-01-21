import { useEffect, useRef } from 'react'
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'

interface InfiniteScrollProps {
    onLoadMore: () => void
    hasMore: boolean
    isLoading: boolean
    isError?: boolean
}

export const InfiniteScrollTrigger = ({
    onLoadMore,
    hasMore,
    isLoading,
    isError,
}: InfiniteScrollProps) => {
    const observerTarget = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                // Если элемент появился в зоне видимости и мы не грузимся прямо сейчас
                if (entries[0].isIntersecting && hasMore && !isLoading && !isError) {
                    onLoadMore()
                }
            },
            { threshold: 0, rootMargin: '200px' }
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            observer.disconnect()
        }
    }, [hasMore, isLoading, isError, onLoadMore])

    return (
        <div
            ref={observerTarget}
            className="w-full py-6 flex flex-col items-center justify-center text-muted-foreground min-h-[80px]"
        >
            {/* Состояние 1: Загрузка */}
            {isLoading && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-medium">Ищем лучшие смены...</span>
                </div>
            )}

            {/* Состояние 2: Ошибка загрузки */}
            {!isLoading && isError && (
                <button
                    onClick={onLoadMore}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Ошибка сети. Нажмите, чтобы повторить
                </button>
            )}

            {/* Состояние 3: Конец списка */}
            {!isLoading && !hasMore && !isError && (
                <div className="flex flex-col items-center gap-1 opacity-60">
                    <div className="w-12 h-1 bg-border rounded-full mb-2" />
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Вы посмотрели все предложения</span>
                    </div>
                </div>
            )}
        </div>
    )
}

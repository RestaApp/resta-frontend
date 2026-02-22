import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'

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
  const { t } = useTranslation()
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
      className="w-full flex flex-col items-center justify-center text-muted-foreground "
    >
      {/* Состояние 1: Загрузка */}
      {isLoading && <Loader size="md" />}

      {/* Состояние 2: Ошибка загрузки */}
      {!isLoading && isError && (
        <Button
          onClick={onLoadMore}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full text-destructive border-destructive"
        >
          <RefreshCw className="w-4 h-4" />
          {t('feed.networkError')}
        </Button>
      )}

      {!isLoading && !hasMore && !isError && (
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="w-12 h-1 bg-border rounded-full mb-2" />
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{t('feed.sawAll')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

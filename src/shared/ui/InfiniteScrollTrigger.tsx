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
  const loadLockedRef = useRef(false)
  const showLoader = isLoading
  const showError = !isLoading && Boolean(isError)
  const showComplete = !isLoading && !hasMore && !isError

  useEffect(() => {
    if (!isLoading) {
      loadLockedRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0]?.isIntersecting

        // Блокируем повторный вызов, пока не изменится состояние загрузки.
        if (isIntersecting && hasMore && !isLoading && !isError && !loadLockedRef.current) {
          loadLockedRef.current = true
          onLoadMore()
        }
      },
      { threshold: 0, rootMargin: '320px 0px' }
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
      className="flex w-full flex-col items-center justify-center text-muted-foreground"
    >
      {showLoader ? <Loader size="md" /> : null}

      {showError ? (
        <Button
          onClick={onLoadMore}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-full border-destructive text-destructive"
        >
          <RefreshCw className="h-4 w-4" />
          {t('feed.networkError')}
        </Button>
      ) : null}

      {showComplete ? (
        <div className="flex flex-col items-center gap-2 opacity-60">
          <div className="h-1 w-12 rounded-full bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>{t('feed.sawAll')}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

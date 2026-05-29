import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUBSECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'

interface ErrorStateProps {
  /** Главный текст: что произошло. */
  title?: string
  /** Деталь — например, локализованное сообщение из API. */
  description?: string
  /** Обработчик «Повторить». Если не задан — кнопка не показывается. */
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState = ({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) => {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center ui-density-page',
        className
      )}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <p className={SUBSECTION_TITLE_CLASS}>
        {title ?? t('common.error', { defaultValue: 'Не удалось загрузить' })}
      </p>
      {description ? <p className="max-w-xs text-sm text-muted-foreground">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="md" onClick={onRetry}>
          {retryLabel ?? t('common.retry', { defaultValue: 'Повторить' })}
        </Button>
      ) : null}
    </div>
  )
}

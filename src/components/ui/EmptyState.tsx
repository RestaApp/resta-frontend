import { useTranslation } from 'react-i18next'
import { CookingPot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message?: string
  /** Пояснение под заголовком (почему пусто, что делать) */
  description?: string
  illustration?: ReactNode
  /** Дополнительное действие под текстом (кнопка CTA и т.п.) */
  action?: ReactNode
  onReset?: () => void
  showResetButton?: boolean
}

export const EmptyState = ({
  message,
  description,
  illustration,
  action,
  onReset,
  showResetButton = false,
}: EmptyStateProps) => {
  const { t } = useTranslation()
  const displayMessage = message ?? t('feed.noShifts')
  const resetButton =
    showResetButton && onReset ? (
      <Button size="md" className="px-6" variant="outline" onClick={onReset}>
        {t('feed.resetFilters')}
      </Button>
    ) : null

  return (
    <div className="flex flex-col items-center justify-center gap-4 ui-density-page py-12">
      {illustration ? (
        <div className="text-muted-foreground">{illustration}</div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
          <CookingPot className="h-8 w-8 stroke-[1.5] text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className={BLOCK_TITLE_CLASS}>{displayMessage}</p>
        {description ? (
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ?? resetButton}
    </div>
  )
}

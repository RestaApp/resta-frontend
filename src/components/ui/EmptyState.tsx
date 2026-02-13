import { useTranslation } from 'react-i18next'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  message?: string
  /** Пояснение под заголовком (почему пусто, что делать) */
  description?: string
  illustration?: React.ReactNode
  onReset?: () => void
  showResetButton?: boolean
}

export const EmptyState = ({
  message,
  description,
  illustration,
  onReset,
  showResetButton = false,
}: EmptyStateProps) => {
  const { t } = useTranslation()
  const displayMessage = message ?? t('feed.noShifts')

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      {illustration ? (
        <div className="mb-2 text-muted-foreground">{illustration}</div>
      ) : (
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
          <ChefHat className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-foreground font-medium text-center mb-1">{displayMessage}</p>
      {description ? (
        <p className="text-muted-foreground text-sm text-center max-w-[280px] mb-4">
          {description}
        </p>
      ) : (
        <p className="mb-4" />
      )}
      {showResetButton && onReset && (
        <Button variant="outline" onClick={onReset}>
          {t('feed.resetFilters')}
        </Button>
      )}
    </div>
  )
}

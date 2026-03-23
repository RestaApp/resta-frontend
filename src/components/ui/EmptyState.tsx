import { useTranslation } from 'react-i18next'
import { CookingPot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message?: string
  /** Пояснение под заголовком (почему пусто, что делать) */
  description?: string
  illustration?: ReactNode
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
        <div className="mb-3 text-muted-foreground">{illustration}</div>
      ) : (
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
          <CookingPot className="h-8 w-8 stroke-[1.5] text-muted-foreground" />
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

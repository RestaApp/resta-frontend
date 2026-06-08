import { useTranslation } from 'react-i18next'
import { CookingPot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import { EMPTY_ILLUSTRATIONS, type EmptyIllustrationId } from '@/components/ui/empty-state-illustrations'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message?: string
  description?: string
  image?: EmptyIllustrationId
  action?: ReactNode
  onReset?: () => void
  showResetButton?: boolean
  density?: 'default' | 'compact'
}

export const EmptyState = ({
  message,
  description,
  image,
  action,
  onReset,
  showResetButton = false,
  density = 'default',
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
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center',
        density === 'compact' ? 'py-6' : 'ui-density-page py-12'
      )}
    >
      {image ? (
        <img
          src={EMPTY_ILLUSTRATIONS[image]}
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="h-24 w-24 shrink-0"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <CookingPot className="h-8 w-8 stroke-[1.5]" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2">
        <p className={BLOCK_TITLE_CLASS}>{displayMessage}</p>
        {description ? (
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ?? resetButton}
    </div>
  )
}

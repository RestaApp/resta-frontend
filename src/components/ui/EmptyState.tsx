import { useTranslation } from 'react-i18next'
import { CookingPot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyStateIllustration } from '@/components/ui/EmptyStateIllustration'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import type { EmptyIllustrationId } from '@/components/ui/empty-state-illustrations'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message?: string
  description?: string
  image?: EmptyIllustrationId
  action?: ReactNode
  onReset?: () => void
  showResetButton?: boolean
  density?: 'default' | 'compact'
  className?: string
}

export const EmptyState = ({
  message,
  description,
  image,
  action,
  onReset,
  showResetButton = false,
  density = 'default',
  className,
}: EmptyStateProps) => {
  const { t } = useTranslation()
  const displayMessage = message ?? t('feed.noShifts')
  const resetButton =
    showResetButton && onReset ? (
      <Button size="md" className="px-6" variant="gradient" onClick={onReset}>
        {t('feed.resetFilters')}
      </Button>
    ) : null
  const isCompact = density === 'compact'

  return (
    <Card
      padding={isCompact ? 'md' : 'lg'}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 text-center',
        isCompact ? 'py-6' : 'py-10',
        className
      )}
    >
      {image ? (
        <EmptyStateIllustration id={image} />
      ) : (
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary [&_svg]:text-primary"
          aria-hidden
        >
          <CookingPot className="h-10 w-10 stroke-[1.5]" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2">
        <p className={BLOCK_TITLE_CLASS}>{displayMessage}</p>
        {description ? (
          <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ?? resetButton}
    </Card>
  )
}

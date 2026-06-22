import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

export const PREVIEW_CARD_STATS_CLASS =
  'mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'

export const PREVIEW_CARD_TAGS_CLASS = 'mt-2 flex flex-wrap gap-1'

export const PREVIEW_CARD_BELOW_TAGS_CLASS = 'flex flex-wrap gap-1'

const PREVIEW_CARD_ACTIONS_CLASS = 'flex w-24 shrink-0 flex-col justify-start gap-2'

// min-w-0 перебивает базовый Button.min-w-fit — иначе кнопка с более длинным
// текстом («Пригласить») шире, чем с коротким («Профиль»). С w-full обе = ширине колонки.
export const PREVIEW_CARD_ACTION_BUTTON_CLASS = 'h-9 w-full min-w-0 px-2 text-xs'

interface PreviewCardLayoutProps {
  avatar: ReactNode
  children: ReactNode
  actions?: ReactNode
  below?: ReactNode
  topRight?: ReactNode
  className?: string
  interactive?: boolean
  ariaLabel?: string
  onActivate?: () => void
}

export const PreviewCardLayout = ({
  avatar,
  children,
  actions,
  below,
  topRight,
  className,
  interactive = false,
  ariaLabel,
  onActivate,
}: PreviewCardLayoutProps) => {
  const mainRow = actions ? (
    <div className="flex gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <div className={PREVIEW_CARD_ACTIONS_CLASS}>{actions}</div>
    </div>
  ) : (
    <div className="flex min-w-0 items-start gap-3">
      {avatar}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )

  const content = (
    <>
      {mainRow}
      {below}
    </>
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onActivate) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onActivate()
  }

  const rootClassName = cn(SHIFT_CARD_CLASS, 'relative', className)

  if (interactive) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={onActivate}
        onKeyDown={handleKeyDown}
        className={cn(rootClassName, SHIFT_CARD_INTERACTIVE_CLASS, below && 'ui-density-stack')}
      >
        {topRight ? <div className="absolute right-3 top-3 z-10">{topRight}</div> : null}
        {content}
      </div>
    )
  }

  return (
    <div className={cn(rootClassName, below && 'ui-density-stack')}>
      {topRight ? <div className="absolute right-3 top-3 z-10">{topRight}</div> : null}
      {content}
    </div>
  )
}

import type { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { SCREEN_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'

type LeadingActionKind = 'back' | 'close'

interface PageHeaderProps {
  /** Основной заголовок страницы. */
  title?: ReactNode
  /** Подзаголовок (например, «Минск · сегодня», город + дата). */
  subtitle?: ReactNode
  /**
   * Мета-лейбл слева сверху над title (моноширинный, маленький, uppercase).
   * Используется для прогресс-меток «BOARD 04 · 02 / 15», «Шаг 2 из 3» и т.п.
   */
  meta?: ReactNode
  /** Стрелка «назад» или крестик «закрыть». При отсутствии — слот пустой. */
  leadingAction?: LeadingActionKind
  /** Обработчик leading-action. Обязателен, если `leadingAction` задан. */
  onLeadingAction?: () => void
  /** ARIA-label для leading-action (i18n). */
  leadingAriaLabel?: string
  /** Правый слот: кнопки/иконки (Edit, Filters, More, ThemeToggle…). */
  rightActions?: ReactNode
  /** Прогресс-бар или другой контент под title/subtitle. */
  progress?: ReactNode
  /** Прилипать к верху страницы (для длинных списков). */
  sticky?: boolean
  className?: string
}

const LEADING_ICON: Record<LeadingActionKind, typeof ArrowLeft> = {
  back: ArrowLeft,
  close: X,
}

/**
 * Универсальная шапка страницы (BOARD-04…08 в Resta Production).
 *
 * SRP: только презентация. Никакой бизнес-логики, никакой router-зависимости.
 * Любые «куда вести назад» / «что закрывать» решает родительская страница.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ [meta]                                       │
 *   │ [◀]  Заголовок              [actions ▸]      │
 *   │      Подзаголовок                            │
 *   │ [progress]                                   │
 *   └──────────────────────────────────────────────┘
 *
 * Touch targets ≥ 44px для leading-action и любых right-actions.
 */
export const PageHeader = ({
  title,
  subtitle,
  meta,
  leadingAction,
  onLeadingAction,
  leadingAriaLabel,
  rightActions,
  progress,
  sticky = false,
  className,
}: PageHeaderProps) => {
  const LeadingIcon = leadingAction ? LEADING_ICON[leadingAction] : null

  return (
    <header
      className={cn(
        'bg-background/92 ui-density-page pt-3 pb-3 backdrop-blur-xl',
        sticky && 'sticky top-0',
        className
      )}
      style={sticky ? { zIndex: Z_INDEX.stickyHeader } : undefined}
    >
      <div className="ui-app-frame flex flex-col gap-3">
        {meta ? (
          <div className="font-mono-resta text-xs uppercase tracking-widest text-muted-foreground">
            {meta}
          </div>
        ) : null}

        <div className="flex min-h-11 items-center gap-2">
          {LeadingIcon ? (
            <button
              type="button"
              onClick={onLeadingAction}
              aria-label={leadingAriaLabel}
              className="-ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LeadingIcon className="h-5 w-5" aria-hidden />
            </button>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title ? <h1 className={SCREEN_TITLE_CLASS}>{title}</h1> : null}
            {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>

          {rightActions ? (
            <div className="flex shrink-0 items-center gap-1">{rightActions}</div>
          ) : null}
        </div>

        {progress ? <div>{progress}</div> : null}
      </div>
    </header>
  )
}

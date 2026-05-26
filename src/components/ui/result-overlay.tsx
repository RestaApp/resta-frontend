import { useEffect, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check } from 'lucide-react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { Button } from '@/components/ui/button'
import { BODY_MUTED_CLASS, STATE_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useTelegramFullscreenOffset } from '@/contexts/telegram/useTelegramFullscreenOffset'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { setupTelegramBackButton } from '@/utils/telegram'
import { cn } from '@/utils/cn'

type ResultOverlayTone = 'success' | 'error'

export interface ResultOverlayAction {
  label: ReactNode
  onClick: () => void
  variant?: ComponentProps<typeof Button>['variant']
  size?: ComponentProps<typeof Button>['size']
}

interface ResultOverlayProps {
  open: boolean
  tone: ResultOverlayTone
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  primaryAction?: ResultOverlayAction
  secondaryAction?: ResultOverlayAction
  onClose: () => void
  className?: string
}

const TONE_CONFIG = {
  success: {
    role: 'status',
    iconClassName: 'bg-success text-white shadow-[var(--shadow-success-cta)]',
    icon: Check,
  },
  error: {
    role: 'alert',
    iconClassName: 'bg-destructive/10 text-destructive border border-destructive/25',
    icon: AlertTriangle,
  },
} as const

const ResultAction = ({
  action,
  fallbackSize,
}: {
  action: ResultOverlayAction
  fallbackSize: 'sm' | 'lg'
}) => (
  <Button
    type="button"
    variant={action.variant ?? 'gradient'}
    size={action.size ?? fallbackSize}
    onClick={action.onClick}
  >
    {action.label}
  </Button>
)

export const ResultOverlay = ({
  open,
  tone,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  className,
}: ResultOverlayProps) => {
  const fullscreenOffset = useTelegramFullscreenOffset()
  const config = TONE_CONFIG[tone]
  const Icon = config.icon

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    return setupTelegramBackButton(onClose)
  }, [onClose, open])

  if (!open) return null

  const node = (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 flex flex-col bg-background/82 backdrop-blur-xl',
        fullscreenOffset.topClassName,
        className
      )}
      style={{ zIndex: Z_INDEX.modal }}
      role="dialog"
      aria-modal="true"
      aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(62,201,126,0.14),transparent_55%)]"
      />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center ui-density-page ui-density-py">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 pb-6 text-center">
          <div
            className={cn('grid h-18 w-18 place-items-center rounded-lg', config.iconClassName)}
            aria-hidden
          >
            <Icon className="h-9 w-9" strokeWidth={2.2} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className={STATE_TITLE_CLASS}>{title}</h2>
            {description ? (
              <p className={cn(BODY_MUTED_CLASS, 'max-w-xs text-center leading-snug')}>
                {description}
              </p>
            ) : null}
          </div>

          {children}
        </div>
      </div>

      {primaryAction || secondaryAction ? (
        <BottomActionBar
          mode="static"
          transparent
          className="relative"
          contentClassName="flex flex-col gap-2"
        >
          {primaryAction ? <ResultAction action={primaryAction} fallbackSize="lg" /> : null}
          {secondaryAction ? <ResultAction action={secondaryAction} fallbackSize="sm" /> : null}
        </BottomActionBar>
      ) : null}
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

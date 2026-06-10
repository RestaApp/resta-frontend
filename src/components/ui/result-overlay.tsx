import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Check, type LucideProps } from 'lucide-react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { Button } from '@/components/ui/button'
import { BODY_MUTED_CLASS, SECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import { cn } from '@/shared/utils/cn'

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
  /** Кастомная иконка — переопределяет дефолтную для текущего tone. */
  icon?: ComponentType<LucideProps>
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

const SUCCESS_CONFETTI = [
  { top: '8%', left: '18%', size: 6, className: 'bg-primary' },
  { top: '14%', left: '78%', size: 5, className: 'bg-warning' },
  { top: '28%', left: '6%', size: 4, className: 'bg-success' },
  { top: '22%', left: '88%', size: 5, className: 'bg-destructive/70' },
  { top: '72%', left: '12%', size: 4, className: 'bg-primary/80' },
  { top: '68%', left: '82%', size: 6, className: 'bg-success/80' },
  { top: '82%', left: '48%', size: 4, className: 'bg-warning/80' },
] as const

const SuccessResultIcon = () => (
  <div className="relative grid h-28 w-28 place-items-center" aria-hidden>
    <div className="absolute inset-0 rounded-full border border-success/10" />
    <div className="absolute inset-3 rounded-full border border-success/15 bg-success/5" />
    <div className="absolute inset-6 rounded-full border border-success/20 bg-success/10" />
    {SUCCESS_CONFETTI.map(({ top, left, size, className }, index) => (
      <span
        key={index}
        className={cn('absolute rounded-full', className)}
        style={{ top, left, width: size, height: size }}
      />
    ))}
    <div className="relative grid h-18 w-18 place-items-center rounded-xl bg-success text-white shadow-[var(--shadow-success-cta)]">
      <Check className="h-9 w-9" strokeWidth={2.2} />
    </div>
  </div>
)

const ResultAction = ({
  action,
  fallbackSize,
}: {
  action: ResultOverlayAction
  fallbackSize: 'sm' | 'md' | 'lg'
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
  icon,
}: ResultOverlayProps) => {
  const fullscreenOffset = useTelegramFullscreenOffset()
  const config = TONE_CONFIG[tone]
  const Icon = icon ?? config.icon
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })
  const stableClose = useCallback(() => onCloseRef.current(), [])

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    return setupTelegramBackButton(stableClose)
  }, [stableClose, open])

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
          {tone === 'success' && !icon ? (
            <SuccessResultIcon />
          ) : (
            <div
              className={cn('grid h-18 w-18 place-items-center rounded-lg', config.iconClassName)}
              aria-hidden
            >
              <Icon className="h-9 w-9" strokeWidth={2.2} />
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <h2 className={SECTION_TITLE_CLASS}>{title}</h2>
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
          contentClassName="flex flex-col items-center gap-2"
        >
          {primaryAction ? <ResultAction action={primaryAction} fallbackSize="md" /> : null}
          {secondaryAction ? <ResultAction action={secondaryAction} fallbackSize="md" /> : null}
        </BottomActionBar>
      ) : null}
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

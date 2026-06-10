import { type ComponentProps, type ComponentType, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, type LucideProps } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DrawerCloseButton } from '@/components/ui/drawer'
import { Modal } from '@/components/ui/modal'
import {
  BODY_MUTED_CLASS,
  FORMATTED_USER_TEXT_CLASS,
  MODAL_SURFACE_CLASS,
  MODAL_TITLE_CLASS,
} from '@/components/ui/ui-patterns'
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
    role: 'status' as const,
    iconClassName: 'bg-success text-white shadow-[var(--shadow-success-cta)]',
    icon: Check,
  },
  error: {
    role: 'alert' as const,
    iconClassName: 'bg-destructive/10 text-destructive border border-destructive/25',
    icon: AlertTriangle,
  },
}

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
    className="w-full"
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
  const { t } = useTranslation()
  const config = TONE_CONFIG[tone]
  const Icon = icon ?? config.icon

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div
        className={cn(MODAL_SURFACE_CLASS, 'relative flex flex-col gap-5 p-6 pt-8', className)}
        role={config.role}
        aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
      >
        <DrawerCloseButton
          onClick={onClose}
          ariaLabel={t('common.close')}
          className="absolute right-3 top-3 rounded-md"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              'grid h-14 w-14 place-items-center rounded-xl',
              icon ? 'bg-secondary/50 text-foreground' : config.iconClassName
            )}
            aria-hidden
          >
            <Icon className="h-7 w-7" strokeWidth={2.2} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className={MODAL_TITLE_CLASS}>{title}</h2>
            {description ? (
              <p
                className={cn(
                  BODY_MUTED_CLASS,
                  FORMATTED_USER_TEXT_CLASS,
                  'max-w-xs text-center leading-snug'
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          {children ? <div className="w-full">{children}</div> : null}
        </div>

        {primaryAction || secondaryAction ? (
          <div className="flex flex-col gap-2">
            {primaryAction ? <ResultAction action={primaryAction} fallbackSize="md" /> : null}
            {secondaryAction ? <ResultAction action={secondaryAction} fallbackSize="md" /> : null}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

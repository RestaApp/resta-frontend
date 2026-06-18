import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SHADOW_MODAL_CLASS } from '@/components/ui/ui-patterns'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { cn } from '@/shared/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const

const TOAST_COLORS = {
  success: 'bg-success',
  error: 'bg-destructive',
  info: 'bg-primary',
  warning: 'bg-warning',
} as const

const ToastCard = memo(function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: () => void
}) {
  const { t } = useTranslation()
  const Icon = TOAST_ICONS[item.type]
  const colorClass = TOAST_COLORS[item.type]

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pointer-events-auto"
    >
      <Card padding="md" className={cn('min-w-70 max-w-[90vw]', SHADOW_MODAL_CLASS)}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
              colorClass
            )}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>

          <p className="flex-1 pr-2 text-sm font-medium text-foreground">{item.message}</p>

          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t('aria.closeNotification')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  )
})

interface ToastViewportProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

/** Стек тостов (top-center). Очередью управляет ToastProvider. */
export const ToastViewport = memo(function ToastViewport({
  toasts,
  onDismiss,
}: ToastViewportProps) {
  const { shouldApply: shouldApplyFullscreenOffset } = useTelegramFullscreenOffset()

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 flex -translate-x-1/2 flex-col items-center gap-2',
        shouldApplyFullscreenOffset ? 'top-20' : 'top-4'
      )}
      style={{ zIndex: Z_INDEX.toast }}
    >
      <AnimatePresence initial={false}>
        {toasts.map(item => (
          <ToastCard key={item.id} item={item} onClose={() => onDismiss(item.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
})

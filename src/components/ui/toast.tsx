import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    message: string
    type?: ToastType
    isVisible: boolean
    onClose: () => void
    duration?: number
    className?: string
}

const TOAST_ICONS = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
} as const

const TOAST_COLORS = {
    success: 'bg-chart-2',
    error: 'bg-destructive',
    info: 'bg-primary',
    warning: 'bg-chart-5',
} as const

export const Toast = memo(function Toast({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 2500,
    className,
}: ToastProps) {
    const { t } = useTranslation()
    const Icon = TOAST_ICONS[type]
    const colorClass = TOAST_COLORS[type]

    useEffect(() => {
        if (!isVisible) return
        const id = window.setTimeout(onClose, duration)
        return () => window.clearTimeout(id)
    }, [isVisible, duration, onClose])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={cn(
                        'fixed left-1/2 top-4 z-[60] -translate-x-1/2',
                        'min-w-[280px] max-w-[90vw] rounded-2xl border border-border bg-card p-4 shadow-xl',
                        className
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', colorClass)}>
                            <Icon className="h-3 w-3 text-white" />
                        </div>

                        <p className="flex-1 pr-2 text-sm font-medium text-foreground">{message}</p>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={t('aria.closeNotification')}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})
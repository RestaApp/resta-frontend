/**
 * Компонент Toast уведомлений
 * Используется для быстрых статусов и уведомлений
 */

import { memo } from 'react'
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
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-orange-500',
} as const

export const Toast = memo(function Toast({
    message,
    type = 'info',
    isVisible,
    onClose,
    className,
}: ToastProps) {
    const Icon = TOAST_ICONS[type]
    const colorClass = TOAST_COLORS[type]

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={cn(
                        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
                        'bg-card border border-border shadow-xl rounded-2xl p-4',
                        'min-w-[280px] max-w-[90vw]',
                        className
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={cn(
                                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                                colorClass
                            )}
                        >
                            <Icon className="w-3 h-3 text-white" />
                        </div>

                        <p className="flex-1 text-sm font-medium text-foreground pr-2">{message}</p>

                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Закрыть уведомление"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
})

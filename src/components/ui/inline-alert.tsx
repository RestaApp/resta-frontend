import { AlertTriangle, Check, Info } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type InlineAlertTone = 'error' | 'success' | 'info'

const TONE_CONFIG = {
  error: {
    container: 'border-destructive/25 bg-destructive/10',
    icon: AlertTriangle,
    iconClass: 'text-destructive',
    textClass: 'text-destructive',
  },
  success: {
    container: 'border-success/25 bg-success/10',
    icon: Check,
    iconClass: 'text-success',
    textClass: 'text-success',
  },
  info: {
    container: 'border-primary/25 bg-primary/10',
    icon: Info,
    iconClass: 'text-primary',
    textClass: 'text-muted-foreground',
  },
} as const

interface InlineAlertProps {
  tone?: InlineAlertTone
  message: string | null | undefined
  className?: string
}

export const InlineAlert = ({ tone = 'error', message, className }: InlineAlertProps) => {
  if (!message) return null
  const config = TONE_CONFIG[tone]
  const Icon = config.icon
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3 py-2.5',
        config.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.iconClass)} aria-hidden />
      <p className={cn('text-sm leading-snug', config.textClass)}>{message}</p>
    </div>
  )
}

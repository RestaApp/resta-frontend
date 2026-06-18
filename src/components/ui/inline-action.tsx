import { memo, type ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

/**
 * Третичное действие-ссылка: компактная inline-кнопка с иконкой и подписью
 * (например «Добавить», «Отметить все», «Удалить»). Без рамки/заливки —
 * только тон текста. Единый тир поверх hero/secondary/destructive `Button`.
 */
type InlineActionTone = 'primary' | 'destructive'

const TONE_CLASS: Record<InlineActionTone, string> = {
  primary: 'text-primary hover:text-primary/80',
  destructive: 'text-muted-foreground hover:text-destructive',
}

interface InlineActionProps extends Omit<ComponentProps<'button'>, 'type'> {
  icon?: LucideIcon
  tone?: InlineActionTone
}

export const InlineAction = memo(function InlineAction({
  icon: Icon,
  tone = 'primary',
  className,
  children,
  ...props
}: InlineActionProps) {
  return (
    <button
      type="button"
      data-haptic="light"
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
        TONE_CLASS[tone],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </button>
  )
})

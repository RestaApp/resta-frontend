import { memo, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Общие стили строки для секций ProfileOverview. */
export const ROW_CLASS = 'flex justify-between items-baseline gap-2 py-2'
export const LABEL_CLASS =
  'font-mono-resta text-xs tracking-wide text-muted-foreground shrink-0 min-w-28'
export const VALUE_CLASS = 'text-sm font-semibold leading-snug text-foreground text-right min-w-0'
export const VALUE_LINK_CLASS =
  'text-sm font-semibold leading-snug text-primary text-right truncate hover:underline min-w-0'

interface InfoRowProps {
  label: string
  children: ReactNode
  href?: string
  valueClassName?: string
}

/**
 * SRP: одна строка `label : value` с опциональной ссылкой.
 * Используется во всех секциях ProfileOverview.
 */
export const InfoRow = memo(
  ({ label, children, href, valueClassName = VALUE_CLASS }: InfoRowProps) => (
    <div className={ROW_CLASS}>
      <span className={LABEL_CLASS}>{label}</span>
      {href ? (
        <a
          href={href}
          className={cn(valueClassName, 'min-w-0 truncate')}
          title={typeof children === 'string' ? children : undefined}
        >
          {children}
        </a>
      ) : (
        <span
          className={cn(valueClassName, 'min-w-0 truncate')}
          title={typeof children === 'string' ? children : undefined}
        >
          {children}
        </span>
      )}
    </div>
  )
)
InfoRow.displayName = 'InfoRow'

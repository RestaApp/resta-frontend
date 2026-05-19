import { memo, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Общие стили строки для ProfileInfoCard. Переиспользуются в employee/business секциях. */
export const ROW_CLASS = 'flex justify-between items-baseline gap-3 py-2.5'
export const LABEL_CLASS = 'text-muted-foreground shrink-0 min-w-32'
export const VALUE_CLASS = 'font-medium text-foreground text-right min-w-0'
export const VALUE_LINK_CLASS =
  'font-medium text-primary text-right truncate hover:underline min-w-0'

interface InfoRowProps {
  label: string
  children: ReactNode
  href?: string
  valueClassName?: string
}

/**
 * SRP: одна строка `label : value` с опциональной ссылкой.
 * Используется во всех секциях ProfileInfoCard.
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

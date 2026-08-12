import { memo, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

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
  onClick?: () => void
  multiline?: boolean
}

/**
 * SRP: одна строка `label : value` с опциональной ссылкой.
 * Используется во всех секциях ProfileOverview.
 */
export const InfoRow = memo(
  ({
    label,
    children,
    href,
    valueClassName = VALUE_CLASS,
    onClick,
    multiline = false,
  }: InfoRowProps) => {
    const valueClasses = cn(
      valueClassName,
      multiline ? 'block min-w-0 whitespace-pre-wrap break-words text-justify' : 'min-w-0 truncate'
    )
    const valueTitle = !multiline && typeof children === 'string' ? children : undefined

    return (
      <div className={multiline ? 'flow-root py-2' : ROW_CLASS}>
        <span className={cn(LABEL_CLASS, multiline && 'relative top-1 float-left mr-2')}>
          {label}
        </span>
        {href ? (
          <a href={href} onClick={onClick} className={valueClasses} title={valueTitle}>
            {children}
          </a>
        ) : (
          <span className={valueClasses} title={valueTitle}>
            {children}
          </span>
        )}
      </div>
    )
  }
)
InfoRow.displayName = 'InfoRow'

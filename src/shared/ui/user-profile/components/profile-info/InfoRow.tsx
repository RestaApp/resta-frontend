import { memo, type ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

/** Общие стили строки для секций ProfileOverview. */
export const ROW_CLASS = 'flex justify-between items-baseline gap-2 py-2'
/** Типографика подписи поля — общая для строк и для подписей над тегами. */
export const LABEL_TEXT_CLASS = 'font-mono-resta text-xs tracking-wide text-muted-foreground'
export const LABEL_CLASS = `${LABEL_TEXT_CLASS} shrink-0 min-w-28`
export const VALUE_CLASS = 'text-sm font-semibold leading-snug text-foreground text-right min-w-0'
export const VALUE_LINK_CLASS =
  'text-sm font-semibold leading-snug text-primary text-right truncate hover:underline min-w-0'

interface InfoRowProps {
  label: string
  children: ReactNode
  href?: string
  valueClassName?: string
  onClick?: () => void
  /** Значение — длинный текст с переносами. По умолчанию он идёт под подписью, на всю ширину. */
  multiline?: boolean
  /** Многострочное значение остаётся в правой колонке, рядом с подписью (адрес, часы работы). */
  multilineColumns?: boolean
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
    multilineColumns = false,
  }: InfoRowProps) => {
    const valueClasses = cn(
      valueClassName,
      multiline
        ? multilineColumns
          ? 'min-w-0 flex-1 whitespace-pre-wrap break-words text-right'
          : 'min-w-0 whitespace-pre-wrap break-words text-left'
        : 'min-w-0 truncate'
    )
    const valueTitle = !multiline && typeof children === 'string' ? children : undefined
    const isStacked = multiline && !multilineColumns

    return (
      <div
        className={
          isStacked ? 'flex flex-col gap-1 py-2' : cn(ROW_CLASS, multiline && 'items-start')
        }
      >
        <span className={LABEL_CLASS}>{label}</span>
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

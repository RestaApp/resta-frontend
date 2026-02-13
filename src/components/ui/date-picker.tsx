import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Формат даты для <input type="date">: YYYY-MM-DD */
export type DateIso = string

interface DatePickerProps {
  /** Дата в формате YYYY-MM-DD */
  value: DateIso | null
  onChange: (date: DateIso | null) => void
  placeholder?: string
  minDate?: DateIso
  className?: string
  label?: string
  id?: string
  error?: string
}

export const DatePicker = ({
  value,
  onChange,
  placeholder,
  minDate,
  className,
  label,
  id,
  error,
}: DatePickerProps) => {
  const { t } = useTranslation()
  const autoId = useId()
  const inputId = id ?? autoId
  const displayPlaceholder = placeholder ?? t('datePicker.placeholder')

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm text-muted-foreground">
          {label}
        </label>
      )}

      <div className="relative flex min-h-10 items-stretch">
        <input
          id={inputId}
          type="date"
          value={value ?? ''}
          onChange={e => onChange(e.target.value || null)}
          min={minDate}
          className={cn(
            'w-full rounded-xl border border-border bg-card/60 py-2 pl-3 pr-10 text-sm text-foreground caret-foreground',
            'transition-all focus:outline-none focus:ring-2 focus:ring-primary/20',
            !value && 'text-transparent',
            !!error && 'border-destructive ring-2 ring-destructive/20',
            '[&::-webkit-calendar-picker-indicator]:opacity-0',
            '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0',
            '[&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer'
          )}
          aria-label={label ?? t('datePicker.ariaLabel')}
          aria-invalid={!!error}
        />

        <CalendarIcon
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />

        {!value && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 inline-flex h-5 -translate-y-1/2 items-center text-sm text-muted-foreground"
            aria-hidden
          >
            {displayPlaceholder}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

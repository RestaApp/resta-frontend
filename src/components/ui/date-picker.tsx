import { useCallback, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { FormField } from '@/components/ui/form-field'
import { CalendarPicker } from '@/components/ui/calendar-picker'

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

function formatDisplayDate(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString(locale, { month: '2-digit', day: '2-digit', year: 'numeric' })
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
  const { t, i18n } = useTranslation()
  const autoId = useId()
  const inputId = id ?? autoId
  const displayPlaceholder = placeholder ?? t('datePicker.placeholder')
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <FormField label={label} htmlFor={inputId} error={error} className={className}>
      <div className="relative">
        <button
          id={inputId}
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className={cn(
            'relative flex min-h-10 w-full items-center rounded-lg border border-border/50 bg-input-background py-2.5 pl-4 pr-10 text-left text-base transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-0',
            !!error && 'border-destructive ring-2 ring-destructive/20',
          )}
          aria-label={label ?? t('datePicker.ariaLabel')}
          aria-invalid={!!error}
          aria-expanded={open}
        >
          {value ? (
            <span className="text-foreground">{formatDisplayDate(value, i18n.language)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{displayPlaceholder}</span>
          )}

          <CalendarIcon
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 shrink-0 -translate-y-1/2 stroke-[1.5] text-muted-foreground"
            aria-hidden
          />
        </button>

        {open && (
          <CalendarPicker
            value={value}
            onChange={onChange}
            onClose={handleClose}
            minDate={minDate}
            locale={i18n.language}
          />
        )}
      </div>
    </FormField>
  )
}

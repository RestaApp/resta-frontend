import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCalendar } from './useCalendar'

interface CalendarPickerProps {
  value: string | null
  onChange: (date: string | null) => void
  onClose: () => void
  minDate?: string
  locale?: string
}

export function CalendarPicker({ value, onChange, onClose, minDate, locale = 'en' }: CalendarPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { monthLabel, dayHeaders, days, goToPrevMonth, goToNextMonth } = useCalendar({
    initialDate: value,
    minDate,
    locale,
  })

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute left-0 right-0 top-full z-50 mt-1.5',
        'rounded-xl border border-border bg-popover p-3',
        'shadow-[var(--shadow-modal)]',
        'animate-fade-in',
      )}
    >
      <div className="mb-2 grid grid-cols-[32px_1fr_32px] items-center gap-1">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-elevated"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-center text-xs font-bold text-muted-foreground">{monthLabel}</span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-elevated"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mb-0.5 grid grid-cols-7">
        {dayHeaders.map((d, i) => (
          <span key={`${d}-${i}`} className="text-center text-[10px] font-bold leading-6 text-foreground">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((cell, i) => {
          if (!cell) {
            return <span key={`e-${i}`} className="min-h-[34px]" aria-hidden />
          }

          const isSelected = value === cell.iso

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={cell.disabled}
              onClick={() => {
                onChange(cell.iso)
                onClose()
              }}
              className={cn(
                'min-h-[34px] border-0 text-xs font-semibold transition-colors rounded-lg',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-foreground hover:bg-primary/15',
                cell.disabled && 'text-muted-foreground opacity-40',
              )}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

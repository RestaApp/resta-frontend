import { Clock } from 'lucide-react'
import { memo, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/utils/cn'

const normalizeTimeInput = (raw: string): string | null => {
  if (raw === '') return ''
  const match = raw.match(/^(\d{1,2}):(\d{1,2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  let totalMinutes = hours * 60 + minutes
  if (totalMinutes < 0) totalMinutes = 0
  if (totalMinutes > 23 * 60 + 59) totalMinutes = 23 * 60 + 59

  const normalizedHours = Math.floor(totalMinutes / 60)
  const normalizedMinutes = totalMinutes % 60
  return `${String(normalizedHours).padStart(2, '0')}:${String(normalizedMinutes).padStart(2, '0')}`
}

export interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Подпись для aria-label кнопки открытия пикера. */
  ariaLabel?: string
  size?: 'default' | 'compact'
  className?: string
  inputClassName?: string
}

/** Единый инпут времени с иконкой часов — как в создании смены. */
export const TimeInput = memo(function TimeInput({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  size = 'default',
  className,
  inputClassName,
}: TimeInputProps) {
  const isCompact = size === 'compact'
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pickerAriaLabel = t('shiftDetails.openTimeAria', {
    label: ariaLabel ?? t('shift.start'),
  })

  const openPicker = () => {
    if (disabled) return
    const input = inputRef.current
    if (!input) return

    const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker
    if (typeof showPicker === 'function') {
      showPicker.call(input)
      return
    }
    input.focus()
  }

  const onIconKey = (e: KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <div
      className={cn(
        'relative transition-none',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <button
        type="button"
        onClick={openPicker}
        onKeyDown={onIconKey}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={pickerAriaLabel}
        className={cn(
          'absolute top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground',
          isCompact ? 'left-2.5 h-4 w-4' : 'left-3 h-5 w-5'
        )}
      >
        <Clock className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </button>
      <Input
        ref={inputRef}
        type="time"
        value={value}
        readOnly={disabled}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onChange={e => {
          if (disabled) return
          const normalized = normalizeTimeInput(e.target.value)
          if (normalized === null) return
          onChange(normalized)
        }}
        className={cn(
          'py-0 leading-none transition-[border-color,box-shadow] [appearance:none] [-webkit-appearance:none]',
          isCompact ? 'h-10 min-h-10 pl-9 text-sm' : 'pl-11 text-base',
          inputClassName
        )}
      />
    </div>
  )
})

import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Field } from './Field'
import { useRef } from 'react'
import type { KeyboardEvent } from 'react'

type TimeFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}

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

export const TimeField = ({ label, value, onChange, error }: TimeFieldProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const openPicker = () => {
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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <Field label={label} error={error}>
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          onKeyDown={onIconKey}
          aria-label={t('shiftDetails.openTimeAria', { label })}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground flex items-center justify-center"
        >
          <Clock className="w-5 h-5" />
        </button>
        <Input
          ref={inputRef}
          type="time"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const normalized = normalizeTimeInput(e.target.value)
            if (normalized === null) return
            onChange(normalized)
          }}
          className="pl-11 py-0 leading-none text-[16px] [appearance:none] [-webkit-appearance:none]"
          aria-invalid={!!error}
        />
      </div>
    </Field>
  )
}

export default TimeField

import { memo } from 'react'
import type { DayKey } from '@/features/profile/model/utils/businessFields'
import { CompactTimeRow } from './CompactTimeRow'

interface DayDetailRowProps {
  day: DayKey
  label: string
  enabled: boolean
  from: string
  to: string
  disabled: boolean
  onChange: (day: DayKey, patch: { enabled?: boolean; from?: string; to?: string }) => void
}

/** Детальная строка одного дня — та же карточка, что и в быстром режиме. */
export const DayDetailRow = memo(
  ({ day, label, enabled, from, to, disabled, onChange }: DayDetailRowProps) => (
    <CompactTimeRow
      label={label}
      enabled={enabled}
      from={from}
      to={to}
      disabled={disabled}
      onToggle={checked => onChange(day, { enabled: checked })}
      onFromChange={next => onChange(day, { from: next })}
      onToChange={next => onChange(day, { to: next })}
    />
  )
)
DayDetailRow.displayName = 'DayDetailRow'

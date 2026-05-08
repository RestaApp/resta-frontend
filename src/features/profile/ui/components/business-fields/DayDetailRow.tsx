import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { DayKey } from '@/features/profile/model/utils/businessFields'

interface DayDetailRowProps {
  day: DayKey
  label: string
  enabled: boolean
  from: string
  to: string
  disabled: boolean
  onChange: (day: DayKey, patch: { enabled?: boolean; from?: string; to?: string }) => void
}

/**
 * Детальная строка одного дня недели в раскрытом режиме business hours:
 * label + switch + from/to inputs (более компактные, чем CompactTimeRow).
 */
export const DayDetailRow = memo(
  ({ day, label, enabled, from, to, disabled, onChange }: DayDetailRowProps) => (
    <div className="grid grid-cols-[42px_1fr] items-center gap-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-1.5">
        <Switch
          checked={enabled}
          disabled={disabled}
          onCheckedChange={checked => onChange(day, { enabled: checked })}
        />
        <Input
          type="time"
          inputMode="numeric"
          value={from}
          disabled={disabled || !enabled}
          onChange={e => onChange(day, { from: e.target.value })}
          className="h-8 min-w-0 px-2 text-center text-sm tabular-nums"
        />
        <span className="text-xs text-muted-foreground">-</span>
        <Input
          type="time"
          inputMode="numeric"
          value={to}
          disabled={disabled || !enabled}
          onChange={e => onChange(day, { to: e.target.value })}
          className="h-8 min-w-0 px-2 text-center text-sm tabular-nums"
        />
      </div>
    </div>
  )
)
DayDetailRow.displayName = 'DayDetailRow'

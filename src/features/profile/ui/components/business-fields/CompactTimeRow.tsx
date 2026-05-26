import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

interface CompactTimeRowProps {
  label: string
  enabled: boolean
  from: string
  to: string
  disabled: boolean
  onToggle: (checked: boolean) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

/**
 * Компактная строка ввода временного диапазона: label + switch + from/to inputs.
 * Используется в Будни / Сб / Вс быстром режиме business hours.
 */
export const CompactTimeRow = memo(
  ({
    label,
    enabled,
    from,
    to,
    disabled,
    onToggle,
    onFromChange,
    onToChange,
  }: CompactTimeRowProps) => (
    <Card padding="none" className={SHIFT_CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className={SHIFT_CARD_TITLE_CLASS}>{label}</div>
        <Switch checked={enabled} disabled={disabled} onCheckedChange={onToggle} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
        <Input
          type="time"
          inputMode="numeric"
          value={from}
          disabled={disabled || !enabled}
          onChange={e => onFromChange(e.target.value)}
          className="min-h-11 min-w-0 px-2 py-2 text-center text-sm font-medium tabular-nums"
        />
        <span className="text-xs font-medium text-muted-foreground">-</span>
        <Input
          type="time"
          inputMode="numeric"
          value={to}
          disabled={disabled || !enabled}
          onChange={e => onToChange(e.target.value)}
          className="min-h-11 min-w-0 px-2 py-2 text-center text-sm font-medium tabular-nums"
        />
      </div>
    </Card>
  )
)
CompactTimeRow.displayName = 'CompactTimeRow'

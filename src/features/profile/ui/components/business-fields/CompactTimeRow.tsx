import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { TimeInput } from '@/components/ui/time-input'
import { ActivityToggleButton } from '@/shared/ui/ActivityToggleButton'
import { SHIFT_CARD_TITLE_CLASS } from '@/components/ui/shift-card/shift-card-styles'

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
 * Компактная карточка диапазона времени: заголовок + кнопка активности + пара TimeInput.
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
  }: CompactTimeRowProps) => {
    const { t } = useTranslation()
    const isTimeDisabled = disabled || !enabled
    const startLabel = t('shift.start')
    const endLabel = t('shift.end')

    return (
      <Card padding="none" className="rounded-lg border border-border bg-card p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className={SHIFT_CARD_TITLE_CLASS}>{label}</div>
          <ActivityToggleButton
            variant="compact"
            checked={enabled}
            disabled={disabled}
            onToggle={onToggle}
            checkedLabel={t('profile.scheduleDayOpen')}
            uncheckedLabel={t('profile.scheduleDayClosed')}
            checkedHint={t('profile.scheduleDayOpenHint')}
            uncheckedHint={t('profile.scheduleDayClosedHint')}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <TimeInput
              size="compact"
              value={from}
              onChange={onFromChange}
              disabled={isTimeDisabled}
              ariaLabel={`${label}, ${startLabel}`}
            />
          </div>
          <span className="shrink-0 text-sm text-muted-foreground" aria-hidden="true">
            -
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <TimeInput
              size="compact"
              value={to}
              onChange={onToChange}
              disabled={isTimeDisabled}
              ariaLabel={`${label}, ${endLabel}`}
            />
          </div>
        </div>
      </Card>
    )
  }
)
CompactTimeRow.displayName = 'CompactTimeRow'

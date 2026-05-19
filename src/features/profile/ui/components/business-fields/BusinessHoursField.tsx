import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import {
  parseBusinessHours,
  serializeBusinessHours,
  type DayKey,
} from '@/features/profile/model/utils/businessFields'
import { CompactTimeRow } from './CompactTimeRow'
import { DayDetailRow } from './DayDetailRow'
import { DAY_LABELS, DAY_ORDER, WEEKDAY_KEYS } from './constants'

interface BusinessHoursFieldProps {
  value: string
  disabled: boolean
  onChange: (next: string) => void
}

const isWeekday = (day: DayKey): boolean => WEEKDAY_KEYS.includes(day)

/**
 * Часы работы заведения: будни одной строкой + Сб + Вс + раскрываемые
 * детальные настройки по дням + быстрые действия (24/7, очистить) + заметки.
 */
export const BusinessHoursField = ({ value, disabled, onChange }: BusinessHoursFieldProps) => {
  const { t } = useTranslation()
  const parsed = useMemo(() => parseBusinessHours(value), [value])
  const [showDetailedDays, setShowDetailedDays] = useState(false)

  const weekdays = useMemo(
    () => parsed.schedule.filter(item => isWeekday(item.day)),
    [parsed.schedule]
  )
  const saturday = parsed.schedule.find(item => item.day === 'sat')
  const sunday = parsed.schedule.find(item => item.day === 'sun')

  const weekdaysSummary = useMemo(() => {
    const enabledDays = weekdays.filter(item => item.enabled)
    if (enabledDays.length === 0) return { enabled: false, from: '09:00', to: '18:00' }
    const [first] = enabledDays
    return { enabled: true, from: first.from, to: first.to }
  }, [weekdays])

  const hasWeekdayCustomPattern = useMemo(() => {
    const [first] = weekdays
    if (!first) return false
    return weekdays.some(
      item => item.enabled !== first.enabled || item.from !== first.from || item.to !== first.to
    )
  }, [weekdays])

  const updateDay = (day: DayKey, patch: { enabled?: boolean; from?: string; to?: string }) => {
    const nextSchedule = parsed.schedule.map(item =>
      item.day === day ? { ...item, ...patch } : item
    )
    onChange(serializeBusinessHours(nextSchedule, parsed.notes))
  }

  const updateWeekdays = (patch: { enabled?: boolean; from?: string; to?: string }) => {
    const nextSchedule = parsed.schedule.map(item =>
      isWeekday(item.day) ? { ...item, ...patch } : item
    )
    onChange(serializeBusinessHours(nextSchedule, parsed.notes))
  }

  const setAlwaysOpen = () => {
    const nextSchedule = parsed.schedule.map(item => ({
      ...item,
      enabled: true,
      from: '00:00',
      to: '23:59',
    }))
    onChange(serializeBusinessHours(nextSchedule, parsed.notes))
  }

  const clearSchedule = () => {
    const nextSchedule = parsed.schedule.map(item => ({ ...item, enabled: false }))
    onChange(serializeBusinessHours(nextSchedule, parsed.notes))
  }

  const setNotes = (nextNotes: string) =>
    onChange(serializeBusinessHours(parsed.schedule, nextNotes))

  return (
    <FormField label={t('profile.businessHours')}>
      <div className="flex flex-col gap-2">
        <CompactTimeRow
          label={t('profile.weekdays', { defaultValue: 'Будни' })}
          enabled={weekdaysSummary.enabled}
          from={weekdaysSummary.from}
          to={weekdaysSummary.to}
          disabled={disabled}
          onToggle={checked => updateWeekdays({ enabled: checked })}
          onFromChange={next => updateWeekdays({ from: next })}
          onToChange={next => updateWeekdays({ to: next })}
        />

        <CompactTimeRow
          label={t('profile.saturdayShort', { defaultValue: 'Сб' })}
          enabled={Boolean(saturday?.enabled)}
          from={saturday?.from ?? '09:00'}
          to={saturday?.to ?? '18:00'}
          disabled={disabled}
          onToggle={checked => updateDay('sat', { enabled: checked })}
          onFromChange={next => updateDay('sat', { from: next })}
          onToChange={next => updateDay('sat', { to: next })}
        />

        <CompactTimeRow
          label={t('profile.sundayShort', { defaultValue: 'Вс' })}
          enabled={Boolean(sunday?.enabled)}
          from={sunday?.from ?? '09:00'}
          to={sunday?.to ?? '18:00'}
          disabled={disabled}
          onToggle={checked => updateDay('sun', { enabled: checked })}
          onFromChange={next => updateDay('sun', { from: next })}
          onToChange={next => updateDay('sun', { to: next })}
        />

        {(showDetailedDays || hasWeekdayCustomPattern) && (
          <div className="flex flex-col gap-1 rounded-xl border border-dashed border-border/60 p-2">
            {DAY_ORDER.map(day => {
              const row = parsed.schedule.find(item => item.day === day)
              if (!row) return null
              return (
                <DayDetailRow
                  key={day}
                  day={day}
                  label={DAY_LABELS[day]}
                  enabled={row.enabled}
                  from={row.from}
                  to={row.to}
                  disabled={disabled}
                  onChange={updateDay}
                />
              )
            })}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => setShowDetailedDays(prev => !prev)}
          className="justify-start px-1 text-muted-foreground"
        >
          {showDetailedDays || hasWeekdayCustomPattern
            ? t('profile.hideDetailedDays', { defaultValue: 'Скрыть точные дни' })
            : t('profile.showDetailedDays', { defaultValue: 'Настроить по дням' })}
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={setAlwaysOpen}
          >
            {t('profile.set247', { defaultValue: '24/7' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={clearSchedule}
          >
            {t('common.clear', { defaultValue: 'Очистить' })}
          </Button>
        </div>

        <Textarea
          value={parsed.notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t('profile.form.businessHoursNotesPlaceholder', {
            defaultValue: 'Дополнительно: перерыв, праздничные дни, особые условия',
          })}
          disabled={disabled}
          rows={2}
          className="min-h-14 resize-y"
        />
      </div>
    </FormField>
  )
}

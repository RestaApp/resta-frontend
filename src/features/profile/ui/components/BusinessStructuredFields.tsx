import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  parseAddresses,
  parseBusinessHours,
  serializeAddresses,
  serializeBusinessHours,
  type DayKey,
} from '@/features/profile/model/utils/businessFields'

interface BusinessAddressesFieldProps {
  value: string
  disabled: boolean
  isRestaurant: boolean
  onChange: (next: string) => void
}

interface BusinessHoursFieldProps {
  value: string
  disabled: boolean
  onChange: (next: string) => void
}

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

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
}

const CompactTimeRow = ({
  label,
  enabled,
  from,
  to,
  disabled,
  onToggle,
  onFromChange,
  onToChange,
}: CompactTimeRowProps) => {
  return (
    <div className="rounded-xl border border-border/60 bg-card/20 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <Switch checked={enabled} disabled={disabled} onCheckedChange={onToggle} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <Input
          type="time"
          inputMode="numeric"
          value={from}
          disabled={disabled || !enabled}
          onChange={e => onFromChange(e.target.value)}
          className="h-9 min-w-0 px-2 text-center text-sm font-medium tabular-nums"
        />
        <span className="text-xs font-medium text-muted-foreground">-</span>
        <Input
          type="time"
          inputMode="numeric"
          value={to}
          disabled={disabled || !enabled}
          onChange={e => onToChange(e.target.value)}
          className="h-9 min-w-0 px-2 text-center text-sm font-medium tabular-nums"
        />
      </div>
    </div>
  )
}

export const BusinessAddressesField = ({
  value,
  disabled,
  isRestaurant,
  onChange,
}: BusinessAddressesFieldProps) => {
  const { t } = useTranslation()
  const addresses = useMemo(() => parseAddresses(value), [value])

  const updateAt = (index: number, nextValue: string) => {
    const next = [...addresses]
    next[index] = nextValue
    onChange(serializeAddresses(next))
  }

  const addLine = () => onChange(serializeAddresses([...addresses, '']))

  const removeAt = (index: number) => {
    const next = addresses.filter((_, itemIndex) => itemIndex !== index)
    onChange(serializeAddresses(next))
  }

  return (
    <FormField
      label={
        isRestaurant
          ? t('profile.addresses', { defaultValue: 'Адрес(а) заведения' })
          : t('profileFields.address', { defaultValue: 'Адрес' })
      }
      hint={
        isRestaurant
          ? t('profile.addressesHint', {
              defaultValue: 'Если у вас несколько точек, укажите каждый адрес с новой строки',
            })
          : undefined
      }
    >
      <div className="space-y-2">
        {addresses.map((address, index) => (
          <div key={`address-${index}`} className="flex items-center gap-2">
            <Input
              value={address}
              onChange={e => updateAt(index, e.target.value)}
              placeholder={t('profile.form.singleAddressPlaceholder', {
                defaultValue: 'Город, улица, дом',
              })}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || addresses.length <= 1}
              onClick={() => removeAt(index)}
            >
              {t('common.remove', { defaultValue: 'Удалить' })}
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addLine}>
          {t('profile.addAddress', { defaultValue: 'Добавить адрес' })}
        </Button>
      </div>
    </FormField>
  )
}

export const BusinessHoursField = ({ value, disabled, onChange }: BusinessHoursFieldProps) => {
  const { t } = useTranslation()
  const parsed = useMemo(() => parseBusinessHours(value), [value])
  const [showDetailedDays, setShowDetailedDays] = useState(false)

  const weekdays = useMemo(
    () => parsed.schedule.filter(item => ['mon', 'tue', 'wed', 'thu', 'fri'].includes(item.day)),
    [parsed.schedule]
  )
  const saturday = parsed.schedule.find(item => item.day === 'sat')
  const sunday = parsed.schedule.find(item => item.day === 'sun')

  const weekdaysSummary = useMemo(() => {
    const enabledDays = weekdays.filter(item => item.enabled)
    if (enabledDays.length === 0) return { enabled: false, from: '09:00', to: '18:00' }
    const [first] = enabledDays
    const isUniform = enabledDays.every(item => item.from === first.from && item.to === first.to)
    if (!isUniform || enabledDays.length !== weekdays.length) {
      return { enabled: true, from: first.from, to: first.to }
    }
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
      ['mon', 'tue', 'wed', 'thu', 'fri'].includes(item.day) ? { ...item, ...patch } : item
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

  const setNotes = (nextNotes: string) => {
    onChange(serializeBusinessHours(parsed.schedule, nextNotes))
  }

  return (
    <FormField label={t('profile.businessHours')}>
      <div className="space-y-2">
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
          <div className="space-y-1.5 rounded-xl border border-dashed border-border/60 p-2">
            {DAY_ORDER.map(day => {
              const row = parsed.schedule.find(item => item.day === day)
              if (!row) return null
              return (
                <div key={day} className="grid grid-cols-[42px_1fr] items-center gap-2">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {DAY_LABELS[day]}
                  </div>
                  <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-1.5">
                    <Switch
                      checked={row.enabled}
                      disabled={disabled}
                      onCheckedChange={checked => updateDay(day, { enabled: checked })}
                    />
                    <Input
                      type="time"
                      inputMode="numeric"
                      value={row.from}
                      disabled={disabled || !row.enabled}
                      onChange={e => updateDay(day, { from: e.target.value })}
                      className="h-8 min-w-0 px-2 text-center text-sm tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <Input
                      type="time"
                      inputMode="numeric"
                      value={row.to}
                      disabled={disabled || !row.enabled}
                      onChange={e => updateDay(day, { to: e.target.value })}
                      className="h-8 min-w-0 px-2 text-center text-sm tabular-nums"
                    />
                  </div>
                </div>
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
          className="resize-y min-h-[3.5rem]"
        />
      </div>
    </FormField>
  )
}

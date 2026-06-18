import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { MonthYearPicker } from '@/components/ui/month-year-picker'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import {
  createEmptyWorkHistoryEntry,
  getWorkHistoryEntryErrors,
  type WorkHistoryFormEntry,
} from '@/shared/utils/workHistory'

interface EmployeeWorkHistoryFieldProps {
  value: WorkHistoryFormEntry[]
  disabled: boolean
  onChange: (next: WorkHistoryFormEntry[]) => void
}

interface WorkHistoryEntryCardProps {
  entry: WorkHistoryFormEntry
  index: number
  disabled: boolean
  onChange: (patch: Partial<WorkHistoryFormEntry>) => void
  onRemove: () => void
}

const WorkHistoryEntryCard = memo(function WorkHistoryEntryCard({
  entry,
  index,
  disabled,
  onChange,
  onRemove,
}: WorkHistoryEntryCardProps) {
  const { t } = useTranslation()
  const errors = getWorkHistoryEntryErrors(entry)
  const requiredError = t('validation.requiredField')

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className={cn(PROFILE_SECTION_LABEL_CLASS, 'flex items-center gap-1.5')}>
          <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {t('profile.workHistory.entryTitle', { index: index + 1 })}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          data-haptic="light"
          className="inline-flex min-h-7 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          aria-label={t('profile.workHistory.removeEntry')}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('common.remove')}
        </button>
      </div>

      <FormField
        label={t('profile.workHistory.company')}
        required
        error={errors.company ? requiredError : undefined}
      >
        <Input
          value={entry.company}
          onChange={event => onChange({ company: event.target.value })}
          placeholder={t('profile.workHistory.companyPlaceholder')}
          disabled={disabled}
          variant={errors.company ? 'error' : 'default'}
        />
      </FormField>

      <FormField
        label={t('profile.workHistory.position')}
        required
        error={errors.position ? requiredError : undefined}
      >
        <Input
          value={entry.position}
          onChange={event => onChange({ position: event.target.value })}
          placeholder={t('profile.workHistory.positionPlaceholder')}
          disabled={disabled}
          variant={errors.position ? 'error' : 'default'}
        />
      </FormField>

      <MonthYearPicker
        label={t('profile.workHistory.startedAt')}
        value={entry.startedAt}
        onChange={startedAt => onChange({ startedAt })}
        disabled={disabled}
        error={errors.startedAt ? requiredError : undefined}
      />

      {!entry.isCurrent ? (
        <MonthYearPicker
          label={t('profile.workHistory.endedAt')}
          value={entry.endedAt}
          onChange={endedAt => onChange({ endedAt })}
          disabled={disabled}
          error={errors.endedAt ? t('profile.workHistory.endBeforeStart') : undefined}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {t('profile.workHistory.currentJob')}
          </p>
          <p className="text-xs text-muted-foreground">{t('profile.workHistory.currentJobHint')}</p>
        </div>
        <Switch
          checked={entry.isCurrent}
          disabled={disabled}
          ariaLabel={t('profile.workHistory.currentJob')}
          onCheckedChange={isCurrent =>
            onChange({ isCurrent, endedAt: isCurrent ? '' : entry.endedAt })
          }
        />
      </div>

      <FormField label={t('profile.workHistory.city')}>
        <Input
          value={entry.city}
          onChange={event => onChange({ city: event.target.value })}
          placeholder={t('profile.workHistory.cityPlaceholder')}
          disabled={disabled}
        />
      </FormField>

      <FormField label={t('profile.workHistory.description')}>
        <Textarea
          value={entry.description}
          onChange={event => onChange({ description: event.target.value })}
          placeholder={t('profile.workHistory.descriptionPlaceholder')}
          disabled={disabled}
          rows={2}
          className="min-h-16 resize-none"
        />
      </FormField>
    </div>
  )
})

/**
 * Поле «История работы» сотрудника: список мест работы с возможностью добавлять,
 * удалять и указывать срок (начало/окончание, либо «работаю сейчас»).
 */
export const EmployeeWorkHistoryField = memo(function EmployeeWorkHistoryField({
  value,
  disabled,
  onChange,
}: EmployeeWorkHistoryFieldProps) {
  const { t } = useTranslation()

  const updateAt = useCallback(
    (index: number, patch: Partial<WorkHistoryFormEntry>) => {
      onChange(
        value.map((entry, itemIndex) => (itemIndex === index ? { ...entry, ...patch } : entry))
      )
    },
    [onChange, value]
  )

  const removeAt = useCallback(
    (index: number) => {
      onChange(value.filter((_, itemIndex) => itemIndex !== index))
    },
    [onChange, value]
  )

  const addEntry = useCallback(() => {
    onChange([...value, createEmptyWorkHistoryEntry()])
  }, [onChange, value])

  return (
    <FormField
      label={t('profile.workHistory.label')}
      hint={t('profile.workHistory.hint')}
      hintPlacement="label"
    >
      <div className="flex flex-col gap-3">
        {value.map((entry, index) => (
          <WorkHistoryEntryCard
            key={entry.id}
            entry={entry}
            index={index}
            disabled={disabled}
            onChange={patch => updateAt(index, patch)}
            onRemove={() => removeAt(index)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={addEntry}
          className="self-start"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('profile.workHistory.addEntry')}
        </Button>
      </div>
    </FormField>
  )
})

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { FormField } from '@/components/ui/form-field'
import { Select, type SelectOption } from '@/components/ui/select'
import { getMonthNames } from '@/shared/utils/workHistory'

/** Значение — строка `YYYY-MM` или пустая строка, пока выбор не завершён. */
interface MonthYearValue {
  year: string
  month: string
}

const parseValue = (value: string | null | undefined): MonthYearValue => {
  const match = /^(\d{4})-(\d{2})$/.exec((value ?? '').trim())
  return match ? { year: match[1] ?? '', month: match[2] ?? '' } : { year: '', month: '' }
}

interface MonthYearPickerProps {
  /** `YYYY-MM` или null/'' */
  value: string | null
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  /** Сколько лет назад показывать в списке (по умолчанию 50). */
  yearsBack?: number
}

/**
 * Выбор месяца и года (`YYYY-MM`) двумя селектами. Значение отдаётся наружу
 * только когда выбраны и месяц, и год — иначе сохраняется промежуточный выбор,
 * а вместо ошибки показывается подсказка «выберите месяц и год».
 */
export const MonthYearPicker = ({
  value,
  onChange,
  label,
  error,
  disabled = false,
  className,
  yearsBack = 50,
}: MonthYearPickerProps) => {
  const { t, i18n } = useTranslation()
  const [selection, setSelection] = useState<MonthYearValue>(() => parseValue(value))

  // Ресинхронизация при внешнем изменении (reset формы, подстановка записи).
  useEffect(() => {
    setSelection(parseValue(value))
  }, [value])

  const monthOptions = useMemo<SelectOption[]>(
    () =>
      getMonthNames(i18n.language).map((label, index) => ({
        value: String(index + 1).padStart(2, '0'),
        label,
      })),
    [i18n.language]
  )

  const yearOptions = useMemo<SelectOption[]>(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: yearsBack + 1 }, (_, index) => {
      const year = String(currentYear - index)
      return { value: year, label: year }
    })
  }, [yearsBack])

  const commit = useCallback(
    (next: MonthYearValue) => {
      setSelection(next)
      if (next.year && next.month) onChange(`${next.year}-${next.month}`)
    },
    [onChange]
  )

  // Выбран ровно один из двух — это ещё не валидное значение `YYYY-MM`.
  const isPartial = Boolean(selection.month) !== Boolean(selection.year)
  const showError = !isPartial && Boolean(error)

  return (
    <FormField
      label={label}
      error={showError ? error : undefined}
      hint={isPartial ? t('profile.workHistory.selectMonthYear') : undefined}
      className={className}
    >
      <div
        className={cn(
          'grid grid-cols-2 gap-2',
          showError &&
            '[&_[role=combobox]]:border-destructive [&_[role=combobox]]:ring-2 [&_[role=combobox]]:ring-destructive/20'
        )}
      >
        <Select
          value={selection.month}
          onChange={month => commit({ ...selection, month })}
          options={monthOptions}
          placeholder={t('profile.workHistory.monthPlaceholder')}
          disabled={disabled}
        />
        <Select
          value={selection.year}
          onChange={year => commit({ ...selection, year })}
          options={yearOptions}
          placeholder={t('profile.workHistory.yearPlaceholder')}
          disabled={disabled}
          searchable
        />
      </div>
    </FormField>
  )
}

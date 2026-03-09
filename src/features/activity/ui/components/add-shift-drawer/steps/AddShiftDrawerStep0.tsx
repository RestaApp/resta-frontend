import { useTranslation } from 'react-i18next'
import { DatePicker } from '@/components/ui/date-picker'
import { Select } from '@/components/ui/select'
import { getTodayDateISO } from '@/utils/datetime'
import { Field, MoneyField, TextField, TimeField } from '../../fields'
import type { AddShiftDrawerStep0Props } from './types'

export const AddShiftDrawerStep0 = ({
  titleRef,
  dateRef,
  timeRef,
  showScheduleFields,
  showShiftTypeSelect,
  shiftType,
  onShiftTypeChange,
  shiftTypeOptions,
  titleLabel,
  titlePlaceholder,
  title,
  onTitleChange,
  titleError,
  date,
  onDateChange,
  dateError,
  startTime,
  onStartTimeChange,
  startTimeError,
  endTime,
  onEndTimeChange,
  endTimeError,
  pay,
  onPayChange,
  payLabel,
  payPlaceholder,
}: AddShiftDrawerStep0Props) => {
  const { t } = useTranslation()

  return (
    <>
      {showShiftTypeSelect ? (
        <Select
          label={t('shift.shiftType')}
          value={shiftType}
          onChange={onShiftTypeChange}
          options={shiftTypeOptions}
          placeholder={t('shift.selectShiftType')}
          searchable={false}
          forceDropdownBelow
        />
      ) : null}

      <div ref={titleRef}>
        <TextField
          label={titleLabel}
          value={title}
          onChange={onTitleChange}
          placeholder={titlePlaceholder}
          error={titleError}
        />
      </div>

      {showScheduleFields ? (
        <>
          <div ref={dateRef}>
            <Field label={t('common.date')}>
              <DatePicker
                value={date}
                onChange={onDateChange}
                minDate={getTodayDateISO()}
                className="w-full"
                error={dateError ?? undefined}
              />
            </Field>
          </div>

          <div ref={timeRef} className="grid grid-cols-2 gap-3 w-full">
            <div className="min-w-0">
              <TimeField
                label={t('shift.start')}
                value={startTime}
                onChange={onStartTimeChange}
                error={startTimeError}
              />
            </div>
            <div className="min-w-0">
              <TimeField
                label={t('shift.end')}
                value={endTime}
                onChange={onEndTimeChange}
                error={endTimeError}
              />
            </div>
          </div>
        </>
      ) : null}

      <MoneyField
        value={pay}
        onChange={onPayChange}
        label={payLabel}
        placeholder={payPlaceholder}
      />
    </>
  )
}

import { CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DatePicker } from '@/components/ui/date-picker'
import { Select } from '@/components/ui/select'
import { getTodayDateISO } from '@/utils/datetime'
import {
  CheckboxField,
  Field,
  LocationField,
  MoneyField,
  MultiSelectSpecializations,
  TextAreaField,
  TextField,
  TimeField,
} from '../fields'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'

type SelectFieldOption = {
  value: string
  label: string
}

export const AddShiftDrawerSuccess = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-10 px-2 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-3">
        <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={1.6} />
      </div>
      <p className="text-foreground font-semibold text-center mb-1">{t('shift.created')}</p>
      <p className="text-muted-foreground text-sm text-center max-w-[320px]">
        {t('shift.createdConfirmation')}
      </p>
    </div>
  )
}

export const AddShiftDrawerProgress = ({
  step,
  totalSteps,
  stepTitle,
}: {
  step: number
  totalSteps: number
  stepTitle: string
}) => {
  const { t } = useTranslation()
  const progress = useMemo(() => `${((step + 1) / totalSteps) * 100}%`, [step, totalSteps])
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('shift.addStepLabel', { current: step + 1, total: totalSteps })}
        </p>
        <p className="text-sm font-medium">{stepTitle}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-muted">
        <div className="h-1 rounded-full bg-primary transition-[width]" style={{ width: progress }} />
      </div>
    </div>
  )
}

export const AddShiftDrawerBanner = ({ message }: { message: string | null }) => {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

export const AddShiftDrawerStep0 = ({
  titleRef,
  dateRef,
  timeRef,
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
}: {
  titleRef: React.RefObject<HTMLDivElement | null>
  dateRef: React.RefObject<HTMLDivElement | null>
  timeRef: React.RefObject<HTMLDivElement | null>
  title: string
  onTitleChange: (value: string) => void
  titleError?: string
  date: string | null
  onDateChange: (value: string | null) => void
  dateError?: string
  startTime: string
  onStartTimeChange: (value: string) => void
  startTimeError?: string
  endTime: string
  onEndTimeChange: (value: string) => void
  endTimeError?: string
  pay: string
  onPayChange: (value: string) => void
}) => {
  const { t } = useTranslation()
  return (
    <>
      <div ref={titleRef}>
        <TextField
          label={t('shift.shiftTitle')}
          value={title}
          onChange={onTitleChange}
          placeholder={t('shift.shiftTitlePlaceholder')}
          error={titleError}
        />
      </div>

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
          <TimeField label={t('shift.end')} value={endTime} onChange={onEndTimeChange} error={endTimeError} />
        </div>
      </div>

      <MoneyField value={pay} onChange={onPayChange} />
    </>
  )
}

export const AddShiftDrawerStep1 = ({
  locationRef,
  positionRef,
  specializationRef,
  isEmployeeRole,
  lockedShiftType,
  shiftType,
  onShiftTypeChange,
  shiftTypeOptions,
  location,
  onLocationChange,
  locationError,
  formPosition,
  onPositionChange,
  positionOptions,
  isPositionsLoading,
  positionError,
  specializations,
  onSpecializationsChange,
  availableSpecializations,
  isSpecializationsLoading,
  specializationError,
}: {
  locationRef: React.RefObject<HTMLDivElement | null>
  positionRef: React.RefObject<HTMLDivElement | null>
  specializationRef: React.RefObject<HTMLDivElement | null>
  isEmployeeRole: boolean
  lockedShiftType: ShiftType | null
  shiftType: ShiftType
  onShiftTypeChange: (value: string) => void
  shiftTypeOptions: SelectFieldOption[]
  location: string
  onLocationChange: (value: string) => void
  locationError?: string
  formPosition: string
  onPositionChange: (value: string) => void
  positionOptions: SelectFieldOption[]
  isPositionsLoading: boolean
  positionError?: string
  specializations: string[]
  onSpecializationsChange: (value: string[]) => void
  availableSpecializations: string[]
  isSpecializationsLoading: boolean
  specializationError?: string
}) => {
  const { t } = useTranslation()
  return (
    <>
      <div ref={locationRef}>
        <LocationField
          label={t('common.location')}
          value={location}
          onChange={onLocationChange}
          placeholder={t('shift.locationPlaceholder')}
          error={locationError}
        />
      </div>

      {!isEmployeeRole ? (
        <Select
          label={t('shift.shiftType')}
          value={shiftType}
          onChange={onShiftTypeChange}
          disabled={!!lockedShiftType}
          options={shiftTypeOptions}
          placeholder={t('shift.selectShiftType')}
          hint={
            lockedShiftType
              ? lockedShiftType === 'vacancy'
                ? t('shift.venueCreatesVacancy')
                : t('shift.employeeCreatesReplacement')
              : undefined
          }
        />
      ) : null}

      <div ref={positionRef}>
        <Select
          label={t('common.position')}
          value={formPosition || ''}
          onChange={onPositionChange}
          options={positionOptions}
          placeholder={t('shift.selectPosition')}
          disabled={isPositionsLoading}
          error={positionError}
        />
      </div>

      <div ref={specializationRef}>
        <MultiSelectSpecializations
          label={t('shift.specialization')}
          value={specializations}
          onChange={onSpecializationsChange}
          options={availableSpecializations}
          placeholder={!formPosition ? t('shift.selectPositionFirst') : t('shift.noSpecializations')}
          disabled={!formPosition}
          isLoading={isSpecializationsLoading}
          error={specializationError}
        />
      </div>
    </>
  )
}

export const AddShiftDrawerStep2 = ({
  descriptionRef,
  requirementsRef,
  description,
  onDescriptionChange,
  descriptionError,
  requirements,
  onRequirementsChange,
  requirementsError,
  urgent,
  onUrgentChange,
}: {
  descriptionRef: React.RefObject<HTMLDivElement | null>
  requirementsRef: React.RefObject<HTMLDivElement | null>
  description: string
  onDescriptionChange: (value: string) => void
  descriptionError?: string
  requirements: string
  onRequirementsChange: (value: string) => void
  requirementsError?: string
  urgent: boolean
  onUrgentChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()
  return (
    <>
      <div ref={descriptionRef}>
        <TextAreaField
          label={t('common.description')}
          value={description}
          onChange={onDescriptionChange}
          placeholder={t('shift.descriptionPlaceholder')}
          minHeight="96px"
          error={descriptionError}
        />
      </div>

      <div ref={requirementsRef}>
        <TextAreaField
          label={t('common.requirements')}
          value={requirements}
          onChange={onRequirementsChange}
          placeholder={t('shift.requirementsPlaceholder')}
          minHeight="80px"
          error={requirementsError}
        />
      </div>

      <CheckboxField id="urgent-shift" label={t('shift.urgent')} checked={urgent} onChange={onUrgentChange} />
    </>
  )
}


import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { DatePicker } from '@/components/ui/date-picker'
import type { CreateShiftResponse, VacancyApiItem } from '@/services/api/shiftsApi'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useLabels } from '@/shared/i18n/hooks'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'
import {
  Field,
  TextField,
  TextAreaField,
  MultiSelectSpecializations,
  TimeField,
  MoneyField,
  CheckboxField,
  LocationField,
} from './fields'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAddShiftForm, type ShiftType } from '../../model/hooks/useAddShiftForm'
import { getTomorrowDateISO } from '@/utils/datetime'

const getLockedShiftType = (role?: string | null): ShiftType | null => {
  if (role === 'employee') return 'replacement'
  if (role === 'restaurant') return 'vacancy'
  return null
}

type AddShiftDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (shift: CreateShiftResponse | null) => void
  initialValues?: VacancyApiItem | null
}

type SelectFieldOption = {
  value: string
  label: string
}

const INITIAL_SHIFT_TYPE: ShiftType = 'vacancy'

export const AddShiftDrawer = (props: AddShiftDrawerProps) => {
  const keyedId = props.open ? String(props.initialValues?.id ?? 'new') : 'closed'
  return <AddShiftDrawerKeyed key={keyedId} {...props} />
}

const AddShiftDrawerKeyed = ({
  open,
  onOpenChange,
  onSave,
  initialValues = null,
}: AddShiftDrawerProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()
  const { userProfile } = useUserProfile()
  const { toast, hideToast } = useToast()
  const isEmployeeRole = userProfile?.role === 'employee'
  const lockedShiftType = getLockedShiftType(userProfile?.role)

  const SHIFT_TYPE_OPTIONS: SelectFieldOption[] = [
    { value: 'vacancy', label: t('common.vacancy') },
    { value: 'replacement', label: t('common.replacement') },
  ]

  const form = useAddShiftForm({
    initialShiftType: lockedShiftType ?? INITIAL_SHIFT_TYPE,
    onSave,
    initialValues,
  })
  const {
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    pay,
    setPay,
    location,
    setLocation,
    requirements,
    setRequirements,
    shiftType,
    setShiftType,
    urgent,
    setUrgent,
    position: formPosition,
    setPosition: setFormPosition,
    specializations,
    setSpecializations,
    submitError,
    isCreating,
    isFormInvalid,
    timeRangeError,
    dateError,
    positionError,
    handleSave,
    resetForm,
  } = form

  const { positions: positionsForDisplay, isLoading: isPositionsLoading } = useUserPositions({
    enabled: open,
  })
  const { specializations: availableSpecializations, isLoading: isSpecializationsLoading } =
    useUserSpecializations({
      position: formPosition || null,
      enabled: open && !!formPosition,
    })

  const handlePositionChange = useCallback(
    (next: string) => {
      if (next !== formPosition && specializations.length > 0) setSpecializations([])
      if (!next && specializations.length > 0) setSpecializations([])
      setFormPosition(next)
    },
    [formPosition, setFormPosition, setSpecializations, specializations.length]
  )

  const handleDrawerOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetForm()
      onOpenChange(next)
    },
    [onOpenChange, resetForm]
  )

  const close = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

  // handleSave provided by hook; when it succeeds we close the drawer

  // timeRangeError and isFormInvalid provided by hook
  const positionsOptions: SelectFieldOption[] = (positionsForDisplay ?? []).map(item => {
    const value = item.originalValue || item.id
    return {
      value,
      label: item.title || getEmployeePositionLabel(value),
    }
  })

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerHeader>
        <DrawerTitle>{t('shift.addTitle')}</DrawerTitle>
        <DrawerDescription>{t('shift.addDescription')}</DrawerDescription>
      </DrawerHeader>

      <div className="space-y-5 p-4">
        <TextField
          label={t('shift.shiftTitle')}
          value={title}
          onChange={setTitle}
          placeholder={t('shift.shiftTitlePlaceholder')}
        />

        <TextAreaField
          label={t('common.description')}
          value={description}
          onChange={setDescription}
          placeholder={t('shift.descriptionPlaceholder')}
          minHeight="96px"
        />

        <Field label={t('common.date')}>
          <DatePicker
            value={date}
            onChange={setDate}
            minDate={getTomorrowDateISO()}
            className="w-full"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <TimeField label={t('shift.start')} value={startTime} onChange={setStartTime} />
          <TimeField label={t('shift.end')} value={endTime} onChange={setEndTime} />
        </div>
        {timeRangeError && <p className="text-sm text-red-500">{timeRangeError}</p>}
        {dateError && <p className="text-sm text-red-500">{dateError}</p>}

        <MoneyField value={pay} onChange={setPay} />

        <LocationField
          label={t('common.location')}
          value={location}
          onChange={setLocation}
          placeholder={t('shift.locationPlaceholder')}
        />

        <TextAreaField
          label={t('common.requirements')}
          value={requirements}
          onChange={setRequirements}
          placeholder={t('shift.requirementsPlaceholder')}
          minHeight="80px"
        />

        {!isEmployeeRole && (
          <Select
            label={t('shift.shiftType')}
            value={shiftType}
            onChange={value => setShiftType(value as ShiftType)}
            disabled={!!lockedShiftType}
            options={SHIFT_TYPE_OPTIONS}
            placeholder={t('shift.selectShiftType')}
            hint={
              lockedShiftType
                ? lockedShiftType === 'vacancy'
                  ? t('shift.venueCreatesVacancy')
                  : t('shift.employeeCreatesReplacement')
                : undefined
            }
          />
        )}

        <div>
          <Select
            label={t('common.position')}
            value={formPosition || ''}
            onChange={handlePositionChange}
            options={positionsOptions}
            placeholder={t('shift.selectPosition')}
            disabled={isPositionsLoading}
          />
          {positionError && <p className="text-sm text-red-500 mt-2">{positionError}</p>}
        </div>

        <div>
          <MultiSelectSpecializations
            label={t('shift.specialization')}
            value={specializations}
            onChange={setSpecializations}
            options={availableSpecializations}
            placeholder={
              !formPosition ? t('shift.selectPositionFirst') : t('shift.noSpecializations')
            }
            disabled={!formPosition}
            isLoading={isSpecializationsLoading}
          />
          {submitError &&
            (submitError.toLowerCase().includes('специализац') ||
              submitError.toLowerCase().includes('specialization')) && (
              <p className="text-sm text-red-500 mt-2">{submitError}</p>
            )}
        </div>

        <CheckboxField
          id="urgent-shift"
          label={t('shift.urgent')}
          checked={urgent}
          onChange={setUrgent}
        />

        {submitError && <p className="text-sm text-red-500">{submitError}</p>}
      </div>

      <DrawerFooter>
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" size="md" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="gradient"
            size="md"
            onClick={async () => {
              const ok = await handleSave()
              if (ok) close()
            }}
            disabled={isFormInvalid}
            loading={isCreating}
          >
            {t('common.save')}
          </Button>
        </div>
      </DrawerFooter>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </Drawer>
  )
}

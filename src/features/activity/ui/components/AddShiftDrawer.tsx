import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
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
const TOTAL_STEPS = 3 as const
type StepIndex = 0 | 1 | 2

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
  const titleRef = useRef<HTMLDivElement | null>(null)
  const dateRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef<HTMLDivElement | null>(null)
  const specializationRef = useRef<HTMLDivElement | null>(null)
  const requirementsRef = useRef<HTMLDivElement | null>(null)
  const [step, setStep] = useState<StepIndex>(0)
  const [attemptedSteps, setAttemptedSteps] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

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
    timeRangeError,
    dateError,
    positionError,
    fieldErrors,
    handleSave,
    resetForm,
  } = form

  const showErrors = didAttemptSubmit || !!submitError
  const showStep0Errors = showErrors || attemptedSteps[0]
  const showStep1Errors = showErrors || attemptedSteps[1]
  const showStep2Errors = showErrors || attemptedSteps[2]
  const requiredFieldError = t('validation.requiredField')
  const titleError = showStep0Errors && !title.trim() ? requiredFieldError : undefined
  const dateFieldError = dateError ?? (showStep0Errors && !date ? requiredFieldError : undefined)
  const startTimeError = showStep0Errors && !startTime ? requiredFieldError : undefined
  const endTimeError =
    timeRangeError ?? (showStep0Errors && !endTime ? requiredFieldError : undefined)
  const locationFieldError =
    fieldErrors.location ?? (showStep1Errors && !location.trim() ? requiredFieldError : undefined)
  const positionFieldError =
    positionError ?? (showStep1Errors && !formPosition ? requiredFieldError : undefined)

  const se = submitError?.toLowerCase() || ''
  const isSpecializationError = se.includes('специализац') || se.includes('specialization')
  const canValidateSpecializations = !!formPosition && !positionError
  const specializationFieldError =
    canValidateSpecializations &&
      (isSpecializationError || (showStep1Errors && specializations.length === 0))
      ? isSpecializationError && submitError
        ? submitError
        : t('validation.specializationRequired')
      : undefined
  const requirementsFieldError =
    fieldErrors.requirements ??
    (showStep2Errors && !requirements.trim() ? requiredFieldError : undefined)

  const genericSubmitError = submitError && !isSpecializationError ? submitError : null

  const scrollToFirstInvalidInStep = useCallback(
    (targetStep: StepIndex) => {
      const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      if (targetStep === 0) {
        if (!title.trim()) return scrollTo(titleRef)
        if (!date || dateError) return scrollTo(dateRef)
        if (!startTime || !endTime || timeRangeError) return scrollTo(timeRef)
      }
      if (targetStep === 1) {
        if (!location.trim()) return scrollTo(locationRef)
        if (!formPosition || positionError) return scrollTo(positionRef)
        if (formPosition && specializations.length === 0) return scrollTo(specializationRef)
      }
      if (targetStep === 2) {
        if (!requirements.trim()) return scrollTo(requirementsRef)
      }
    },
    [
      date,
      dateError,
      endTime,
      formPosition,
      location,
      positionError,
      requirements,
      specializations.length,
      startTime,
      timeRangeError,
      title,
    ]
  )

  const findFirstInvalidStep = useCallback((): StepIndex => {
    if (!title.trim()) return 0
    if (!date || dateError) return 0
    if (!startTime || !endTime || timeRangeError) return 0
    if (!location.trim()) return 1
    if (!formPosition || positionError) return 1
    if (formPosition && specializations.length === 0) return 1
    if (!requirements.trim()) return 2
    return 2
  }, [
    date,
    dateError,
    endTime,
    formPosition,
    location,
    positionError,
    requirements,
    specializations.length,
    startTime,
    timeRangeError,
    title,
  ])

  const isStepValid = useCallback(
    (targetStep: StepIndex): boolean => {
      if (targetStep === 0) {
        return !!title.trim() && !!date && !!startTime && !!endTime && !timeRangeError && !dateError
      }
      if (targetStep === 1) {
        if (!location.trim()) return false
        if (!formPosition || !!positionError) return false
        if (specializations.length === 0) return false
        return true
      }
      if (targetStep === 2) {
        if (!requirements.trim()) return false
        return true
      }
      return true
    },
    [
      date,
      dateError,
      endTime,
      formPosition,
      location,
      positionError,
      requirements,
      specializations.length,
      startTime,
      timeRangeError,
      title,
    ]
  )

  const handleDrawerOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setStep(0)
        setAttemptedSteps([false, false, false])
        setDidAttemptSubmit(false)
        setIsSuccessOpen(false)
        resetForm()
      }
      onOpenChange(next)
    },
    [onOpenChange, resetForm]
  )

  const close = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

  useEffect(() => {
    if (!open) return
    if (!isSuccessOpen) return
    const id = window.setTimeout(() => close(), 3000)
    return () => window.clearTimeout(id)
  }, [close, isSuccessOpen, open])

  const handleContinue = useCallback(() => {
    setAttemptedSteps(prev => {
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
      next[step] = true
      return next
    })

    if (isStepValid(step)) setStep(prev => (prev < 2 ? ((prev + 1) as StepIndex) : prev))
    else scrollToFirstInvalidInStep(step)
  }, [isStepValid, scrollToFirstInvalidInStep, step])

  const handleBackOrCancel = useCallback(() => {
    if (step === 0) {
      close()
      return
    }
    setStep(prev => (prev > 0 ? ((prev - 1) as StepIndex) : prev))
  }, [close, step])

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

  // handleSave provided by hook; when it succeeds we close the drawer

  // timeRangeError and isFormInvalid provided by hook
  const positionsOptions: SelectFieldOption[] = (positionsForDisplay ?? []).map(item => {
    const value = item.originalValue || item.id
    return {
      value,
      label: item.title || getEmployeePositionLabel(value),
    }
  })

  const stepTitle = useMemo(() => {
    if (step === 0) return t('shift.addStep1Title')
    if (step === 1) return t('shift.addStep2Title')
    return t('shift.addStep3Title')
  }, [step, t])

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerHeader>
        <DrawerTitle>{t('shift.addTitle')}</DrawerTitle>
        <DrawerDescription>{t('shift.addDescription')}</DrawerDescription>
      </DrawerHeader>

      <div className="space-y-5 p-4">
        {isSuccessOpen ? (
          <div className="flex flex-col items-center justify-center py-10 px-2 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 text-success" strokeWidth={1.6} />
            </div>
            <p className="text-foreground font-semibold text-center mb-1">{t('shift.created')}</p>
            <p className="text-muted-foreground text-sm text-center max-w-[320px]">
              {t('shift.createdConfirmation')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {t('shift.addStepLabel', { current: step + 1, total: TOTAL_STEPS })}
              </p>
              <p className="text-sm font-medium">{stepTitle}</p>
            </div>
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary transition-[width]"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {!isSuccessOpen && step === 0 ? (
          <>
            <div ref={titleRef}>
              <TextField
                label={t('shift.shiftTitle')}
                value={title}
                onChange={setTitle}
                placeholder={t('shift.shiftTitlePlaceholder')}
                error={titleError}
              />
            </div>

            <div ref={dateRef}>
              <Field label={t('common.date')}>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  minDate={getTomorrowDateISO()}
                  className="w-full"
                  error={dateFieldError ?? undefined}
                />
              </Field>
            </div>

            <div ref={timeRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0">
                <TimeField
                  label={t('shift.start')}
                  value={startTime}
                  onChange={setStartTime}
                  error={startTimeError}
                />
              </div>
              <div className="min-w-0">
                <TimeField
                  label={t('shift.end')}
                  value={endTime}
                  onChange={setEndTime}
                  error={endTimeError}
                />
              </div>
            </div>

            <MoneyField value={pay} onChange={setPay} />
          </>
        ) : null}

        {!isSuccessOpen && step === 1 ? (
          <>
            <div ref={locationRef}>
              <LocationField
                label={t('common.location')}
                value={location}
                onChange={setLocation}
                placeholder={t('shift.locationPlaceholder')}
                error={locationFieldError}
              />
            </div>

            {!isEmployeeRole ? (
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
            ) : null}

            <div ref={positionRef}>
              <Select
                label={t('common.position')}
                value={formPosition || ''}
                onChange={handlePositionChange}
                options={positionsOptions}
                placeholder={t('shift.selectPosition')}
                disabled={isPositionsLoading}
                error={positionFieldError}
              />
            </div>

            <div ref={specializationRef}>
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
                error={specializationFieldError}
              />
            </div>
          </>
        ) : null}

        {!isSuccessOpen && step === 2 ? (
          <>
            <TextAreaField
              label={t('common.description')}
              value={description}
              onChange={setDescription}
              placeholder={t('shift.descriptionPlaceholder')}
              minHeight="96px"
            />

            <div ref={requirementsRef}>
              <TextAreaField
                label={t('common.requirements')}
                value={requirements}
                onChange={setRequirements}
                placeholder={t('shift.requirementsPlaceholder')}
                minHeight="80px"
                error={requirementsFieldError}
              />
            </div>

            <CheckboxField
              id="urgent-shift"
              label={t('shift.urgent')}
              checked={urgent}
              onChange={setUrgent}
            />
          </>
        ) : null}

        {!isSuccessOpen && genericSubmitError ? (
          <p className="text-sm text-red-500">{genericSubmitError}</p>
        ) : null}
      </div>

      <DrawerFooter>
        {isSuccessOpen ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setIsSuccessOpen(false)
                setStep(0)
                setAttemptedSteps([false, false, false])
                setDidAttemptSubmit(false)
              }}
            >
              {t('shift.createAnother')}
            </Button>
            <Button variant="gradient" size="md" onClick={close}>
              {t('common.close')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button variant="outline" size="md" onClick={handleBackOrCancel}>
              {step === 0 ? t('common.cancel') : t('common.back')}
            </Button>
            {step === 2 ? (
              <Button
                variant="gradient"
                size="md"
                onClick={async () => {
                  setDidAttemptSubmit(true)
                  const ok = await handleSave()
                  if (ok) {
                    if (initialValues?.id) close()
                    else setIsSuccessOpen(true)
                  } else {
                    const invalidStep = findFirstInvalidStep()
                    setStep(invalidStep)
                    setAttemptedSteps([true, true, true])
                    setTimeout(() => scrollToFirstInvalidInStep(invalidStep), 0)
                  }
                }}
                loading={isCreating}
              >
                {t('common.save')}
              </Button>
            ) : (
              <Button variant="gradient" size="md" onClick={handleContinue}>
                {t('common.continue')}
              </Button>
            )}
          </div>
        )}
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

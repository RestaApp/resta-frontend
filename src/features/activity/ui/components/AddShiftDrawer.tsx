import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import type { CreateShiftResponse, VacancyApiItem } from '@/services/api/shiftsApi'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useLabels } from '@/shared/i18n/hooks'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'
import { useAddShiftForm, type ShiftType } from '../../model/hooks/useAddShiftForm'
import { AddShiftDrawerFooter } from './add-shift-drawer/AddShiftDrawerFooter'
import {
  AddShiftDrawerBanner,
  AddShiftDrawerProgress,
  AddShiftDrawerStep0,
  AddShiftDrawerStep1,
  AddShiftDrawerStep2,
  AddShiftDrawerSuccess,
} from './add-shift-drawer/AddShiftDrawerSteps'
import { useAddShiftDrawerController } from './add-shift-drawer/useAddShiftDrawerController'

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
  const shiftTypeOptions: SelectFieldOption[] = useMemo(
    () => [
      { value: 'vacancy', label: t('common.vacancy') },
      { value: 'replacement', label: t('common.replacement') },
    ],
    [t]
  )

  const form = useAddShiftForm({
    initialShiftType: lockedShiftType ?? INITIAL_SHIFT_TYPE,
    onSave,
    initialValues,
  })
  const controller = useAddShiftDrawerController({
    open,
    onOpenChange,
    initialValues,
    t,
    form,
  })

  const { positions: positionsForDisplay, isLoading: isPositionsLoading } = useUserPositions({
    enabled: open,
  })
  const { specializations: availableSpecializations, isLoading: isSpecializationsLoading } =
    useUserSpecializations({
      position: form.position || null,
      enabled: open && !!form.position,
    })

  const positionOptions: SelectFieldOption[] = useMemo(
    () =>
      (positionsForDisplay ?? []).map(item => {
        const value = item.originalValue || item.id
        return {
          value,
          label: item.title || getEmployeePositionLabel(value),
        }
      }),
    [getEmployeePositionLabel, positionsForDisplay]
  )

  const stepTitle = useMemo(() => {
    if (controller.state.step === 0) return t('shift.addStep1Title')
    if (controller.state.step === 1) return t('shift.addStep2Title')
    return t('shift.addStep3Title')
  }, [controller.state.step, t])

  return (
    <Drawer open={open} onOpenChange={controller.actions.handleDrawerOpenChange}>
      <DrawerHeader>
        <DrawerTitle>{t('shift.addTitle')}</DrawerTitle>
        <DrawerDescription>{t('shift.addDescription')}</DrawerDescription>
      </DrawerHeader>

      <div className="space-y-5 p-4">
        {controller.state.isSuccessOpen ? (
          <AddShiftDrawerSuccess />
        ) : (
          <AddShiftDrawerProgress step={controller.state.step} totalSteps={TOTAL_STEPS} stepTitle={stepTitle} />
        )}

        {!controller.state.isSuccessOpen && controller.state.step === 0 ? (
          <AddShiftDrawerStep0
            titleRef={controller.refs.titleRef}
            dateRef={controller.refs.dateRef}
            timeRef={controller.refs.timeRef}
            title={form.title}
            onTitleChange={controller.actions.handleTitleChange}
            titleError={controller.derived.errors.titleError}
            date={form.date}
            onDateChange={controller.actions.handleDateChange}
            dateError={controller.derived.errors.dateFieldError ?? undefined}
            startTime={form.startTime}
            onStartTimeChange={controller.actions.handleStartTimeChange}
            startTimeError={controller.derived.errors.startTimeError}
            endTime={form.endTime}
            onEndTimeChange={controller.actions.handleEndTimeChange}
            endTimeError={controller.derived.errors.endTimeError}
            pay={form.pay}
            onPayChange={controller.actions.handlePayChange}
          />
        ) : null}

        {!controller.state.isSuccessOpen && controller.state.step === 1 ? (
          <AddShiftDrawerStep1
            locationRef={controller.refs.locationRef}
            positionRef={controller.refs.positionRef}
            specializationRef={controller.refs.specializationRef}
            isEmployeeRole={isEmployeeRole}
            lockedShiftType={lockedShiftType}
            shiftType={form.shiftType}
            onShiftTypeChange={controller.actions.handleShiftTypeChange}
            shiftTypeOptions={shiftTypeOptions}
            location={form.location}
            onLocationChange={controller.actions.handleLocationChange}
            locationError={controller.derived.errors.locationFieldError}
            formPosition={form.position}
            onPositionChange={controller.actions.handlePositionChange}
            positionOptions={positionOptions}
            isPositionsLoading={isPositionsLoading}
            positionError={controller.derived.errors.positionFieldError}
            specializations={form.specializations}
            onSpecializationsChange={controller.actions.handleSpecializationsChange}
            availableSpecializations={availableSpecializations}
            isSpecializationsLoading={isSpecializationsLoading}
            specializationError={controller.derived.errors.specializationFieldError}
          />
        ) : null}

        {!controller.state.isSuccessOpen && controller.state.step === 2 ? (
          <AddShiftDrawerStep2
            descriptionRef={controller.refs.descriptionRef}
            requirementsRef={controller.refs.requirementsRef}
            description={form.description}
            onDescriptionChange={controller.actions.handleDescriptionChange}
            descriptionError={controller.derived.errors.descriptionFieldError}
            requirements={form.requirements}
            onRequirementsChange={controller.actions.handleRequirementsChange}
            requirementsError={controller.derived.errors.requirementsFieldError}
            urgent={form.urgent}
            onUrgentChange={controller.actions.handleUrgentChange}
          />
        ) : null}

        {!controller.state.isSuccessOpen ? <AddShiftDrawerBanner message={controller.derived.bannerError} /> : null}
      </div>

      <DrawerFooter className="border-t border-border/50 bg-background px-5 py-4">
        <AddShiftDrawerFooter
          isSuccessOpen={controller.state.isSuccessOpen}
          step={controller.state.step}
          onBackOrCancel={controller.actions.handleBackOrCancel}
          onContinue={controller.actions.handleContinue}
          onSubmit={controller.actions.handleSubmit}
          isCreating={form.isCreating}
          onCreateAnother={controller.actions.handleCreateAnother}
          onClose={controller.actions.close}
        />
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

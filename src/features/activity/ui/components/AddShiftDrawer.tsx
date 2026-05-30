import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
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
import { toLocationArray } from '@/shared/utils/location'
import { useAddShiftForm, type ShiftType } from '../../model/hooks/useAddShiftForm'
import { AddShiftDrawerFooter } from './add-shift-drawer/AddShiftDrawerFooter'
import {
  AddShiftDrawerBanner,
  AddShiftDrawerProgress,
  type SelectFieldOption,
  AddShiftDrawerStep0,
  AddShiftDrawerStep1,
  AddShiftDrawerStep2,
} from './add-shift-drawer/AddShiftDrawerSteps'
import { ResultOverlay } from '@/components/ui/result-overlay'
import { useAddShiftDrawerController } from './add-shift-drawer/useAddShiftDrawerController'
import {
  getDrawerCopy,
  getLockedShiftType,
  INITIAL_SHIFT_TYPE,
  TOTAL_STEPS,
} from './add-shift-drawer/config'
import { normalizeCatalogPosition } from '@/utils/roles'

type AddShiftDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (shift: CreateShiftResponse | null) => void
  initialValues?: VacancyApiItem | null
  initialShiftType?: ShiftType | null
  lockShiftType?: boolean
}

export const AddShiftDrawer = (props: AddShiftDrawerProps) => {
  const keyedId = props.open
    ? String(props.initialValues?.id ?? `new-${props.initialShiftType ?? 'vacancy'}`)
    : 'closed'
  return <AddShiftDrawerKeyed key={keyedId} {...props} />
}

const AddShiftDrawerKeyed = ({
  open,
  onOpenChange,
  onSave,
  initialValues = null,
  initialShiftType = null,
  lockShiftType = false,
}: AddShiftDrawerProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()
  const { userProfile } = useUserProfile()
  const { toast, hideToast } = useToast()
  const isVenueRole = userProfile?.role === 'restaurant' || userProfile?.role === 'venue'
  const isEmployeeUser = userProfile?.role === 'employee'
  const roleLockedShiftType = getLockedShiftType(userProfile?.role)
  const lockedShiftType = roleLockedShiftType ?? (lockShiftType ? initialShiftType : null)
  const shiftTypeOptions: SelectFieldOption[] = useMemo(
    () => [
      { value: 'vacancy', label: t('common.vacancy') },
      { value: 'replacement', label: t('common.replacement') },
    ],
    [t]
  )

  const profileAddresses = useMemo(
    () => toLocationArray(userProfile?.location),
    [userProfile?.location]
  )
  // По умолчанию подставляем сохранённые адреса заведения; city не дублируется в location.
  const defaultLocation = useMemo<string[] | null>(
    () => (profileAddresses.length > 0 ? profileAddresses : null),
    [profileAddresses]
  )

  const initialLocationFromValues = useMemo(() => {
    const fromValues = toLocationArray(initialValues?.location)
    return fromValues.length > 0 ? fromValues : null
  }, [initialValues?.location])

  const userCity = userProfile?.city?.trim() || null
  const employeeFixedPosition = useMemo(
    () =>
      normalizeCatalogPosition(
        userProfile?.position || userProfile?.employee_profile?.position || ''
      ),
    [userProfile?.employee_profile?.position, userProfile?.position]
  )
  const employeePositionLabel = useMemo(
    () => (employeeFixedPosition ? getEmployeePositionLabel(employeeFixedPosition) : ''),
    [employeeFixedPosition, getEmployeePositionLabel]
  )

  const form = useAddShiftForm({
    initialShiftType: lockedShiftType ?? initialShiftType ?? INITIAL_SHIFT_TYPE,
    onSave,
    initialValues,
    initialLocation: initialLocationFromValues ?? defaultLocation,
    initialCity: userCity,
    userCity,
  })
  const controller = useAddShiftDrawerController({
    onOpenChange,
    t,
    form,
  })

  const { positions: positionsForDisplay, isLoading: isPositionsLoading } = useUserPositions({
    enabled: open && !isEmployeeUser,
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

  useEffect(() => {
    if (!open || !isEmployeeUser || !employeeFixedPosition) return
    if (form.position === employeeFixedPosition) return
    form.setPosition(employeeFixedPosition)
  }, [open, isEmployeeUser, employeeFixedPosition, form])

  const stepTitle = useMemo(() => {
    if (controller.state.step === 0) {
      return form.shiftType === 'vacancy'
        ? t('shift.addStep1TitleVacancy', { defaultValue: 'Основные данные' })
        : t('shift.addStep1Title')
    }
    if (controller.state.step === 1) return t('shift.addStep2Title')
    return t('shift.addStep3Title')
  }, [controller.state.step, form.shiftType, t])

  const isVacancyType = form.shiftType === 'vacancy'
  const drawerCopy = useMemo(
    () =>
      getDrawerCopy(isVacancyType, t, {
        isEmployeeReplacement: isEmployeeUser && !isVacancyType,
      }),
    [isVacancyType, isEmployeeUser, t]
  )

  const successCopy = useMemo(
    () => ({
      title: initialValues?.id
        ? t('shift.updated', { defaultValue: 'Смена обновлена' })
        : t('shift.created', { defaultValue: 'Смена создана' }),
      description: t('shift.createdConfirmation', {
        defaultValue: 'Теперь она появится в «Мои смены».',
      }),
    }),
    [initialValues?.id, t]
  )

  return (
    <>
    <Drawer
      open={open && !controller.state.isSuccessOpen}
      onOpenChange={controller.actions.handleDrawerOpenChange}
      onTelegramBack={controller.actions.handleBackOrCancel}
    >
      <DrawerFrame className="flex-1">
      <DrawerHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <DrawerTitle>{drawerCopy.drawerTitle}</DrawerTitle>
            <DrawerDescription>{drawerCopy.drawerDescription}</DrawerDescription>
          </div>
          <DrawerCloseButton
            onClick={() => controller.actions.handleDrawerOpenChange(false)}
            ariaLabel={t('common.close')}
          />
        </div>
      </DrawerHeader>

      <DrawerBody className="ui-density-stack gap-3">
        <AddShiftDrawerProgress
          step={controller.state.step}
          totalSteps={TOTAL_STEPS}
          stepTitle={stepTitle}
        />

        {controller.state.step === 0 ? (
          <AddShiftDrawerStep0
            titleRef={controller.refs.titleRef}
            dateRef={controller.refs.dateRef}
            timeRef={controller.refs.timeRef}
            showScheduleFields={!isVacancyType}
            showShiftTypeSelect={isVenueRole && !lockedShiftType}
            shiftType={form.shiftType}
            onShiftTypeChange={controller.actions.handleShiftTypeChange}
            shiftTypeOptions={shiftTypeOptions}
            titleLabel={drawerCopy.titleLabel}
            titlePlaceholder={drawerCopy.titlePlaceholder}
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
            payLabel={drawerCopy.payLabel}
            payPlaceholder={drawerCopy.payPlaceholder}
          />
        ) : null}

        {controller.state.step === 1 ? (
          <AddShiftDrawerStep1
            locationRef={controller.refs.locationRef}
            positionRef={controller.refs.positionRef}
            specializationRef={controller.refs.specializationRef}
            location={form.location}
            onLocationChange={controller.actions.handleLocationChange}
            locationError={controller.derived.errors.locationFieldError}
            city={form.city}
            onCityChange={controller.actions.handleCityChange}
            cityError={controller.derived.errors.cityFieldError}
            profileAddresses={profileAddresses}
            isEmployeeMode={isEmployeeUser}
            employeePositionLabel={employeePositionLabel}
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

        {controller.state.step === 2 ? (
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
            isVacancyType={isVacancyType}
          />
        ) : null}

        <AddShiftDrawerBanner message={controller.derived.bannerError} />
      </DrawerBody>

      <DrawerFooter>
        <AddShiftDrawerFooter
          step={controller.state.step}
          onBackOrCancel={controller.actions.handleBackOrCancel}
          onContinue={controller.actions.handleContinue}
          onSubmit={controller.actions.handleSubmit}
          isCreating={form.isCreating}
        />
      </DrawerFooter>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      </DrawerFrame>
    </Drawer>

    <ResultOverlay
      open={controller.state.isSuccessOpen}
      tone="success"
      title={successCopy.title}
      description={successCopy.description}
      onClose={controller.actions.close}
      primaryAction={{
        label: t('common.close'),
        onClick: controller.actions.close,
        variant: 'gradient',
      }}
      secondaryAction={
        initialValues?.id
          ? undefined
          : {
              label: t('shift.createAnother'),
              onClick: controller.actions.handleCreateAnother,
              variant: 'outline',
            }
      }
    />
    </>
  )
}

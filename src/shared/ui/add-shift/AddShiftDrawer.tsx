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
import { useUserPositions } from '@/shared/lib/hooks/useUserPositions'
import { useUserSpecializations } from '@/shared/lib/hooks/useUserSpecializations'
import { useLabels } from '@/shared/i18n/hooks'
import { useUserProfile } from '@/shared/lib/hooks/useUserProfile'
import { toLocationArray } from '@/shared/utils/location'
import { useAddShiftForm } from './model/useAddShiftForm'
import type { ShiftType } from '@/shared/shifts/types'
import { AddShiftDrawerFooter } from './drawer/AddShiftDrawerFooter'
import { StepPanel } from '@/components/ui/step-panel'
import { StepProgress } from '@/components/ui/step-progress'
import {
  AddShiftDrawerBanner,
  type SelectFieldOption,
  AddShiftDrawerStep0,
  AddShiftDrawerStep1,
  AddShiftDrawerStep2,
} from './drawer/AddShiftDrawerSteps'
import { ResultOverlay } from '@/components/ui/result-overlay'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { UsageIndicator } from '@/shared/ui/UsageIndicator'
import { useAddShiftDrawerController } from './drawer/useAddShiftDrawerController'
import { getDrawerCopy, getLockedShiftType, INITIAL_SHIFT_TYPE, TOTAL_STEPS } from './drawer/config'
import { normalizeCatalogPosition } from '@/shared/utils/roles'

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
  const employeeProfileSpecializations = useMemo(() => {
    if (!isEmployeeUser || !userProfile) return []
    const ep = userProfile.employee_profile
    const raw = ep?.specializations?.length
      ? ep.specializations
      : userProfile.specialization
        ? [userProfile.specialization]
        : []
    return Array.from(new Set(raw.filter(Boolean)))
  }, [isEmployeeUser, userProfile])

  const form = useAddShiftForm({
    initialShiftType: lockedShiftType ?? initialShiftType ?? INITIAL_SHIFT_TYPE,
    onSave,
    initialValues,
    initialLocation: initialLocationFromValues ?? defaultLocation,
    initialCity: userCity,
    userCity,
  })
  const { position, specializations, setPosition, setSpecializations } = form
  const controller = useAddShiftDrawerController({
    onOpenChange,
    isEditing: Boolean(initialValues?.id),
    t,
    form,
  })

  const { positions: positionsForDisplay, isLoading: isPositionsLoading } = useUserPositions({
    enabled: open && !isEmployeeUser,
  })
  const { specializations: catalogSpecializations, isLoading: isCatalogSpecializationsLoading } =
    useUserSpecializations({
      position: position || null,
      enabled: open && !!position && !isEmployeeUser,
    })
  const availableSpecializations = isEmployeeUser
    ? employeeProfileSpecializations
    : catalogSpecializations
  const isSpecializationsLoading = isEmployeeUser ? false : isCatalogSpecializationsLoading

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
    if (position === employeeFixedPosition) return
    setPosition(employeeFixedPosition)
  }, [open, isEmployeeUser, employeeFixedPosition, position, setPosition])

  useEffect(() => {
    if (!open || !isEmployeeUser || employeeProfileSpecializations.length === 0) return

    const validSelected = specializations.filter(spec =>
      employeeProfileSpecializations.includes(spec)
    )
    const shouldAutoSelect = !initialValues?.id && validSelected.length === 0

    if (shouldAutoSelect) {
      setSpecializations(employeeProfileSpecializations)
      return
    }

    if (validSelected.length !== specializations.length) {
      setSpecializations(validSelected.length > 0 ? validSelected : employeeProfileSpecializations)
    }
  }, [
    open,
    isEmployeeUser,
    employeeProfileSpecializations,
    specializations,
    setSpecializations,
    initialValues?.id,
  ])

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
        onOpenChange={controller.actions.requestClose}
        onTelegramBack={controller.actions.handleBackOrCancel}
      >
        <DrawerFrame className="flex-1">
          <DrawerHeader>
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <DrawerTitle>{drawerCopy.drawerTitle}</DrawerTitle>
                  <DrawerDescription>{drawerCopy.drawerDescription}</DrawerDescription>
                </div>
                <DrawerCloseButton
                  onClick={() => controller.actions.requestClose(false)}
                  ariaLabel={t('common.close')}
                />
              </div>
              <StepProgress current={controller.state.step + 1} total={TOTAL_STEPS} />
            </div>
          </DrawerHeader>

          <DrawerBody className="ui-density-stack gap-3">
            {controller.state.step === 0 && !initialValues?.id ? (
              <UsageIndicator shiftType={form.shiftType} />
            ) : null}
            <StepPanel stepKey={controller.state.step} className="gap-3">
              {controller.state.step === 0 ? (
                <AddShiftDrawerStep0
                  titleRef={controller.refs.titleRef}
                  dateRef={controller.refs.dateRef}
                  timeRef={controller.refs.timeRef}
                  payRef={controller.refs.payRef}
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
                  payError={controller.derived.errors.payFieldError}
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
                  isVacancyType={isVacancyType}
                />
              ) : null}
            </StepPanel>

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
        </DrawerFrame>
      </Drawer>

      <ResultOverlay
        open={controller.state.isSuccessOpen}
        tone="success"
        title={successCopy.title}
        description={successCopy.description}
        onClose={controller.actions.close}
        primaryAction={
          initialValues?.id || isEmployeeUser
            ? undefined
            : {
                label: t('shift.createAnother'),
                onClick: controller.actions.handleCreateAnother,
                variant: 'gradient',
              }
        }
      />

      <ConfirmDialog
        open={controller.state.confirmDiscardOpen}
        onOpenChange={controller.actions.setConfirmDiscardOpen}
        title={t('shift.discardConfirmTitle')}
        description={t('shift.discardConfirmDescription')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('shift.discardConfirm')}
        confirmVariant="destructive"
        onConfirm={controller.actions.confirmDiscard}
      />
    </>
  )
}

import { memo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useEditProfileModel } from '../../model/hooks/useEditProfileModel'
import { useProfileFormLabels } from '@/shared/i18n/hooks'
import { useScrollToRefWhen } from '@/shared/lib/hooks/useScrollToRefWhen'
import { StepPanel } from '@/components/ui/step-panel'
import { StepProgress } from '@/components/ui/step-progress'
import { getEditProfileStepNameKey } from './edit-profile/editProfileStepNames'
import { EditProfileStepContent } from './edit-profile/EditProfileStepContent'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialSection?: 'specializations' | 'supplierTypes' | null
}

export const EditProfileDrawer = memo(
  ({ open, onOpenChange, onSuccess, initialSection = null }: EditProfileDrawerProps) => {
    const { t } = useTranslation()
    const specializationRef = useRef<HTMLDivElement | null>(null)
    const supplierTypesRef = useRef<HTMLDivElement | null>(null)
    const { getBioLabelSuffix } = useProfileFormLabels()
    const initialStep =
      initialSection === 'specializations' ? 1 : initialSection === 'supplierTypes' ? 2 : 0
    const {
      userProfile,
      apiRole,
      formData,
      cities,
      isCitiesLoading,
      isLoading,
      positions,
      isPositionsLoading,
      specializationOptions,
      isSpecializationsLoading,
      supplierTypeOptions,
      isSupplierTypesLoading,
      experienceYearsForSlider,
      step,
      totalSteps,
      handleNext,
      handleBack,
      handleSave,
      updateField,
      showCityWarning,
      setShowCityWarning,
      fieldErrors,
      handleSaveWithoutCity,
      resetForm,
      openForm,
    } = useEditProfileModel(open, onSuccess, initialStep as 0 | 1 | 2)

    useEffect(() => {
      if (open) openForm()
    }, [open, openForm])

    const handleDrawerOpenChange = useCallback(
      (next: boolean) => {
        if (!next) resetForm()
        onOpenChange(next)
      },
      [onOpenChange, resetForm]
    )

    const handleCancel = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

    useScrollToRefWhen(
      open && initialSection === 'specializations' && apiRole === 'employee' && step === 1,
      specializationRef
    )
    useScrollToRefWhen(
      open && initialSection === 'supplierTypes' && apiRole === 'supplier' && step === 2,
      supplierTypesRef
    )

    if (!userProfile) return null

    const bioSuffix = getBioLabelSuffix(apiRole)
    const isLastStep = step === totalSteps - 1
    const photoUrl = userProfile.photo_url || userProfile.profile_photo_url || null

    const stepNameKey = getEditProfileStepNameKey(apiRole, step)

    return (
      <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
        <DrawerFrame className="flex-1">
          <DrawerHeader>
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <DrawerTitle>{t('profile.editProfile')}</DrawerTitle>
                <DrawerCloseButton onClick={handleCancel} ariaLabel={t('common.close')} />
              </div>
              {totalSteps > 1 ? (
                <StepProgress current={step + 1} total={totalSteps} stepNameKey={stepNameKey} />
              ) : null}
            </div>
          </DrawerHeader>

          <DrawerBody>
            <StepPanel stepKey={step}>
              <EditProfileStepContent
                apiRole={apiRole}
                step={step}
                formData={formData}
                fieldErrors={fieldErrors}
                cities={cities}
                isCitiesLoading={isCitiesLoading}
                isLoading={isLoading}
                photoUrl={photoUrl}
                bioSuffix={bioSuffix}
                experienceYearsForSlider={experienceYearsForSlider}
                positions={positions}
                isPositionsLoading={isPositionsLoading}
                specializationOptions={specializationOptions}
                isSpecializationsLoading={isSpecializationsLoading}
                specializationRef={specializationRef}
                supplierTypeOptions={supplierTypeOptions}
                isSupplierTypesLoading={isSupplierTypesLoading}
                supplierTypesRef={supplierTypesRef}
                updateField={updateField}
              />
            </StepPanel>
          </DrawerBody>

          <DrawerFooter
            contentClassName={step === 0 && totalSteps > 1 ? undefined : 'grid grid-cols-2 gap-2'}
          >
            {step === 0 && totalSteps > 1 ? (
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full"
                variant="gradient"
                size="md"
              >
                {t('onboarding.telegram.next')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={step === 0 ? handleCancel : handleBack}
                  disabled={isLoading}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  {step === 0 ? t('common.cancel') : t('common.back')}
                </Button>
                <Button
                  onClick={isLastStep ? handleSave : handleNext}
                  disabled={isLoading}
                  className="flex-1"
                  variant="gradient"
                  size="md"
                >
                  {isLastStep
                    ? isLoading
                      ? t('common.saving')
                      : t('common.save')
                    : t('onboarding.telegram.next')}
                </Button>
              </>
            )}
          </DrawerFooter>
        </DrawerFrame>
        <AlertDialog open={showCityWarning} onOpenChange={setShowCityWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.cityNotSet')}</AlertDialogTitle>
              <AlertDialogDescription>{t('profile.cityWarningDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCityWarning(false)}>
                {t('common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveWithoutCity}>
                {t('profile.saveWithoutCity')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Drawer>
    )
  }
)
EditProfileDrawer.displayName = 'EditProfileDrawer'

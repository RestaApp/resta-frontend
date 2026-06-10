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
import { BusinessFieldsSection } from './edit-profile/BusinessFieldsSection'
import { StepProgress } from '@/components/ui/step-progress'
import { EditProfileStepBasic } from './edit-profile/EditProfileStepBasic'
import { EditProfileStepProfessional } from './edit-profile/EditProfileStepProfessional'
import { EditProfileStepAbout } from './edit-profile/EditProfileStepAbout'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialSection?: 'specializations' | null
}

export const EditProfileDrawer = memo(
  ({ open, onOpenChange, onSuccess, initialSection = null }: EditProfileDrawerProps) => {
    const { t } = useTranslation()
    const specializationRef = useRef<HTMLDivElement | null>(null)
    const { getBioLabelSuffix } = useProfileFormLabels()
    const initialStep = initialSection === 'specializations' ? 1 : 0
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
    } = useEditProfileModel(open, onSuccess, initialStep as 0 | 1)

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

    useEffect(() => {
      if (!open || initialSection !== 'specializations' || apiRole !== 'employee' || step !== 1) {
        return
      }

      const frame = requestAnimationFrame(() => {
        specializationRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      })

      return () => cancelAnimationFrame(frame)
    }, [apiRole, initialSection, open, step])

    if (!userProfile) return null

    const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
    const bioSuffix = getBioLabelSuffix(apiRole)
    const isLastStep = step === totalSteps - 1
    const photoUrl = userProfile.photo_url || userProfile.profile_photo_url || null

    const renderStepContent = () => {
      if (apiRole === 'employee') {
        if (step === 0) {
          return (
            <EditProfileStepBasic
              apiRole={apiRole}
              formData={formData}
              fieldErrors={fieldErrors}
              cities={cities}
              isCitiesLoading={isCitiesLoading}
              isLoading={isLoading}
              photoUrl={photoUrl}
              updateField={updateField}
            />
          )
        }

        if (step === 1) {
          return (
            <EditProfileStepProfessional
              formData={formData}
              fieldErrors={fieldErrors}
              experienceYearsValue={experienceYearsForSlider}
              positions={positions}
              isPositionsLoading={isPositionsLoading}
              specializationOptions={specializationOptions}
              isSpecializationsLoading={isSpecializationsLoading}
              specializationRef={specializationRef}
              disabled={isLoading}
              updateField={updateField}
            />
          )
        }

        return (
          <EditProfileStepAbout
            formData={formData}
            bioSuffix={bioSuffix}
            isLoading={isLoading}
            updateField={updateField}
          />
        )
      }

      if (step === 0) {
        return (
          <EditProfileStepBasic
            apiRole={apiRole}
            formData={formData}
            fieldErrors={fieldErrors}
            cities={cities}
            isCitiesLoading={isCitiesLoading}
            isLoading={isLoading}
            updateField={updateField}
          />
        )
      }

      return (
        <>
          <EditProfileStepAbout
            formData={formData}
            bioSuffix={bioSuffix}
            isLoading={isLoading}
            updateField={updateField}
          />
          {isBusinessRole ? (
            <BusinessFieldsSection
              apiRole={apiRole}
              formData={formData}
              isLoading={isLoading}
              supplierTypeOptions={supplierTypeOptions}
              isSupplierTypesLoading={isSupplierTypesLoading}
              updateField={updateField}
            />
          ) : null}
        </>
      )
    }

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
                <StepProgress current={step + 1} total={totalSteps} />
              ) : null}
            </div>
          </DrawerHeader>

          <DrawerBody className="ui-density-stack">{renderStepContent()}</DrawerBody>

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

import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
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
import { BasicProfileFields } from './edit-profile/BasicProfileFields'
import { EmployeeFieldsSection } from './edit-profile/EmployeeFieldsSection'
import { BusinessFieldsSection } from './edit-profile/BusinessFieldsSection'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Drawer редактирования профиля — оркестратор:
 *  • header / описание (роль‑зависимое);
 *  • `BasicProfileFields` — общие поля (имя/фамилия/bio/email/phone/city);
 *  • `EmployeeFieldsSection` — только для employee;
 *  • `BusinessFieldsSection` — только для restaurant/supplier;
 *  • footer CTA + диалог подтверждения для save без города.
 *
 * Public API (`EditProfileDrawerProps`) и поведение reset/save сохранены 1:1.
 */
export const EditProfileDrawer = memo(
  ({ open, onOpenChange, onSuccess }: EditProfileDrawerProps) => {
    const { t } = useTranslation()
    const { getBioLabelSuffix } = useProfileFormLabels()
    const {
      userProfile,
      apiRole,
      formData,
      cities,
      isCitiesLoading,
      isLoading,
      supplierTypeOptions,
      isSupplierTypesLoading,
      experienceYearsForSlider,
      handleSave,
      updateField,
      showCityWarning,
      setShowCityWarning,
      fieldErrors,
      handleSaveWithoutCity,
      resetForm,
    } = useEditProfileModel(open, onSuccess)

    const handleDrawerOpenChange = useCallback(
      (next: boolean) => {
        if (!next) resetForm()
        onOpenChange(next)
      },
      [onOpenChange, resetForm]
    )

    const handleCancel = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

    if (!userProfile) return null

    const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
    const bioSuffix = getBioLabelSuffix(apiRole)
    const editProfileDescription =
      apiRole === 'restaurant'
        ? t('profile.editProfileDescriptionRestaurant')
        : apiRole === 'supplier'
          ? t('profile.editProfileDescriptionSupplier')
          : t('profile.editProfileDescription')

    return (
      <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
        <DrawerHeader>
          <DrawerTitle>{t('profile.editProfile')}</DrawerTitle>
          <DrawerDescription>{editProfileDescription}</DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="ui-density-stack">
          <BasicProfileFields
            apiRole={apiRole}
            formData={formData}
            fieldErrors={fieldErrors}
            cities={cities}
            isCitiesLoading={isCitiesLoading}
            isLoading={isLoading}
            bioSuffix={bioSuffix}
            updateField={updateField}
          />

          {apiRole === 'employee' && (
            <EmployeeFieldsSection
              experienceYearsValue={experienceYearsForSlider}
              openToWork={formData.openToWork}
              skills={formData.skills}
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          {isBusinessRole && (
            <BusinessFieldsSection
              apiRole={apiRole}
              formData={formData}
              isLoading={isLoading}
              supplierTypeOptions={supplierTypeOptions}
              isSupplierTypesLoading={isSupplierTypesLoading}
              updateField={updateField}
            />
          )}
        </DrawerBody>

        <DrawerFooter className="sticky bottom-0 z-10 flex-row">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="outline"
            size="md"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
            variant="gradient"
            size="md"
          >
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </DrawerFooter>

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

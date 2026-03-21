import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { RangeSlider } from '@/components/ui'
import { CitySelect } from '@/components/ui/city-select'
import { Loader } from '@/components/ui/loader'
import { Badge } from '@/components/ui/badge'
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
import { formatExperienceText } from '@/utils/experience'
import { useEditProfileModel } from '../../model/hooks/useEditProfileModel'
import { useProfileFormLabels } from '@/shared/i18n/hooks'
import type { ProfileFormData } from '../../model/utils/buildUpdateUserRequest'

interface EmployeeFieldsSectionProps {
  experienceYearsValue: number
  openToWork: boolean
  skills: string
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
  disabled: boolean
}

const EmployeeFieldsSection = memo(
  ({
    experienceYearsValue,
    openToWork,
    skills,
    updateField,
    disabled,
  }: EmployeeFieldsSectionProps) => {
    const { t } = useTranslation()
    const skillsList = useMemo(() => {
      const parts = skills
        .split(/[,;\n]+/g)
        .map(item => item.trim())
        .filter(Boolean)
      const seen = new Set<string>()
      return parts.filter(item => {
        const key = item.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }, [skills])

    return (
      <>
        <FormField label={t('profile.experienceYearsLabel')}>
          <div className="mb-3">
            <span className="text-lg font-semibold text-gradient">
              {formatExperienceText(experienceYearsValue)}
            </span>
          </div>
          <RangeSlider
            min={0}
            max={5}
            step={1}
            value={experienceYearsValue}
            onChange={value => updateField('experienceYears', value)}
            showTicks={true}
            tickCount={5}
          />
        </FormField>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
          <div>
            <p className="block text-sm font-medium mb-1">{t('profile.openToWork')}</p>
            <p className="text-xs text-muted-foreground">{t('profile.openToWorkDescription')}</p>
          </div>
          <Switch
            checked={openToWork}
            onCheckedChange={checked => updateField('openToWork', checked)}
            disabled={disabled}
          />
        </div>
        <FormField label={t('profile.skills')} hint={t('profile.skillsExample')}>
          <Textarea
            value={skills}
            onChange={e => updateField('skills', e.target.value)}
            placeholder={t('profile.form.skillsPlaceholder')}
            disabled={disabled}
            rows={3}
            className="resize-none"
          />
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skillsList.map(skill => (
                <Badge key={skill} variant="tag">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </FormField>
      </>
    )
  }
)
EmployeeFieldsSection.displayName = 'EmployeeFieldsSection'

interface EditProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

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

    const bioSuffix = getBioLabelSuffix(apiRole)

    return (
      <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
        <DrawerHeader>
          <DrawerTitle>{t('profile.editProfile')}</DrawerTitle>
          <DrawerDescription>{t('profile.editProfileDescription')}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4 pb-4">
          <FormField
            label={`${t('profile.nameLabel')} ${apiRole === 'restaurant' || apiRole === 'supplier' ? t('profile.nameOrTitle') : ''}`.trim()}
            required
            error={fieldErrors.name}
          >
            <Input
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder={t('profile.form.namePlaceholder')}
              disabled={isLoading}
              aria-invalid={fieldErrors.name ? true : undefined}
            />
          </FormField>

          {apiRole === 'employee' && (
            <FormField label={t('profile.surnameRequired')} required error={fieldErrors.lastName}>
              <Input
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
                placeholder={t('profile.form.surnamePlaceholder')}
                disabled={isLoading}
                aria-invalid={fieldErrors.lastName ? true : undefined}
              />
            </FormField>
          )}

          <FormField label={`${t('common.description')} ${bioSuffix}`.trim()}>
            <Textarea
              value={formData.bio}
              onChange={e => updateField('bio', e.target.value)}
              placeholder={t('profile.bioPlaceholder', { suffix: bioSuffix })}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
          </FormField>

          <FormField label={t('profile.email')}>
            <Input
              type="email"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder={t('profile.form.emailPlaceholder')}
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label={t('profile.phoneRequired')}
            hint={t('profile.phoneHint')}
            required
            error={fieldErrors.phone}
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder={t('phone.placeholderExample')}
              disabled={isLoading}
              aria-invalid={fieldErrors.phone ? true : undefined}
            />
          </FormField>

          {apiRole === 'employee' && (
            <EmployeeFieldsSection
              experienceYearsValue={experienceYearsForSlider}
              openToWork={formData.openToWork}
              skills={formData.skills}
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          <FormField label={t('profile.cityRequired')} required error={fieldErrors.city}>
            {isCitiesLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader size="sm" />
              </div>
            ) : (
              <CitySelect
                value={formData.city}
                onChange={value => updateField('city', value)}
                options={cities}
                placeholder={t('profile.form.cityPlaceholder')}
                disabled={isLoading}
                error={fieldErrors.city}
              />
            )}
          </FormField>

          {apiRole === 'restaurant' && (
            <FormField
              label={t('profile.addresses', { defaultValue: 'Адрес(а) заведения' })}
              hint={t('profile.addressesHint', {
                defaultValue: 'Если у вас несколько точек, укажите каждый адрес с новой строки',
              })}
            >
              <Textarea
                value={formData.location}
                onChange={e => updateField('location', e.target.value)}
                placeholder={t('profile.form.addressesPlaceholder', {
                  defaultValue: 'Например:\nМинск, ул. Ленина, 1\nМинск, пр-т Победителей, 9',
                })}
                disabled={isLoading}
                rows={4}
                className="resize-y"
              />
            </FormField>
          )}
        </div>

        <DrawerFooter className="sticky bottom-0 z-10 border-t border-border/50 bg-background px-5 py-4 flex-row">
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

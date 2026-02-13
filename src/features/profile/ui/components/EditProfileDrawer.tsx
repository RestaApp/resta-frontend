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

const TEXTAREA_CLASS =
  'w-full min-h-[100px] rounded-xl border border-border/50 px-4 py-3 text-base bg-input-background text-foreground caret-foreground transition-all outline-none focus-visible:border-purple-500/50 focus-visible:ring-purple-500/10 focus-visible:ring-4 disabled:opacity-50 resize-none'

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
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('profile.experienceYearsLabel')}
          </label>
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
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
          <div>
            <label className="block text-sm font-medium mb-1">{t('profile.openToWork')}</label>
            <p className="text-xs text-muted-foreground">{t('profile.openToWorkDescription')}</p>
          </div>
          <Switch
            checked={openToWork}
            onCheckedChange={checked => updateField('openToWork', checked)}
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('profile.skills')}</label>
          <textarea
            value={skills}
            onChange={e => updateField('skills', e.target.value)}
            placeholder={t('profile.form.skillsPlaceholder')}
            disabled={disabled}
            rows={3}
            className={TEXTAREA_CLASS}
          />
          {skillsList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skillsList.map(skill => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-white text-black border-border/40"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{t('profile.skillsExample')}</p>
        </div>
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
      <Drawer enableContentDragToClose open={open} onOpenChange={handleDrawerOpenChange}>
        <DrawerHeader>
          <DrawerTitle>{t('profile.editProfile')}</DrawerTitle>
          <DrawerDescription>{t('profile.editProfileDescription')}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4 pb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('profile.nameLabel')}{' '}
              {apiRole === 'restaurant' || apiRole === 'supplier' ? t('profile.nameOrTitle') : ''} *
            </label>
            <Input
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder={t('profile.form.namePlaceholder')}
              disabled={isLoading}
            />
          </div>

          {apiRole === 'employee' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('profile.surnameRequired')}
              </label>
              <Input
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
                placeholder={t('profile.form.surnamePlaceholder')}
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.description')} {bioSuffix}
            </label>
            <textarea
              value={formData.bio}
              onChange={e => updateField('bio', e.target.value)}
              placeholder={t('profile.bioPlaceholder', { suffix: bioSuffix })}
              disabled={isLoading}
              rows={4}
              className={TEXTAREA_CLASS}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.email')}</label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              placeholder={t('profile.form.emailPlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.phoneRequired')}</label>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
              placeholder={t('phone.placeholderExample')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('profile.phoneHint')}</p>
          </div>

          {apiRole === 'employee' && (
            <EmployeeFieldsSection
              experienceYearsValue={experienceYearsForSlider}
              openToWork={formData.openToWork}
              skills={formData.skills}
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          <div>
            <label className="block text-sm font-medium mb-2">{t('profile.cityRequired')}</label>
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
              />
            )}
          </div>
        </div>

        <DrawerFooter className="sticky bottom-0 z-10 border-t border-border/50 bg-card px-5 py-4 flex-row">
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.name.trim()}
            className="flex-1"
            variant="gradient"
            size="md"
          >
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="outline"
            size="md"
            className="flex-1"
          >
            {t('common.cancel')}
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

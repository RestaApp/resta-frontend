import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import type { ApiRole } from '@/shared/types/roles.types'
import { BusinessAddressesField } from '../business-fields/BusinessAddressesField'
import { BusinessHoursField } from '../business-fields/BusinessHoursField'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EditProfileStepAbout } from './EditProfileStepAbout'

interface EditProfileStepVenueInfoProps {
  apiRole: ApiRole | null
  formData: ProfileFormData
  bioSuffix: string
  isLoading: boolean
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/** Шаг 3 для ресторана: адреса, сайт, описание, email и заметки по графику. */
export const EditProfileStepVenueInfo = memo(function EditProfileStepVenueInfo({
  apiRole,
  formData,
  bioSuffix,
  isLoading,
  updateField,
}: EditProfileStepVenueInfoProps) {
  const { t } = useTranslation()

  return (
    <>
      <BusinessAddressesField
        value={formData.location}
        disabled={isLoading}
        isRestaurant={apiRole === 'restaurant'}
        onChange={next => updateField('location', next)}
      />

      <FormField label={t('profile.venueWebsite')} hint={t('profile.venueWebsiteHint')}>
        <Input
          type="url"
          inputMode="url"
          autoComplete="url"
          value={formData.website}
          onChange={e => updateField('website', e.target.value)}
          placeholder={t('profile.form.websitePlaceholder')}
          disabled={isLoading}
        />
      </FormField>

      <EditProfileStepAbout
        formData={formData}
        bioSuffix={bioSuffix}
        isLoading={isLoading}
        updateField={updateField}
      />

      <BusinessHoursField
        value={formData.businessHours}
        disabled={isLoading}
        variant="notes"
        onChange={next => updateField('businessHours', next)}
      />
    </>
  )
})

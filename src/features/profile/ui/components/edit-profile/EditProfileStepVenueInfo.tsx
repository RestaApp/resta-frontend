import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { MultiSelectTagsList } from '@/shared/ui/MultiSelectTagsList'
import { useLabels } from '@/shared/i18n/hooks'
import { useGetCuisineTypesQuery, useGetRestaurantFormatsQuery } from '@/services/api/rolesApi'
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

/** Шаг 3 для ресторана: формат, кухни, адреса, сайт, описание, email и заметки по графику. */
export const EditProfileStepVenueInfo = memo(function EditProfileStepVenueInfo({
  apiRole,
  formData,
  bioSuffix,
  isLoading,
  updateField,
}: EditProfileStepVenueInfoProps) {
  const { t } = useTranslation()
  const { getRestaurantFormatLabel, getCuisineTypeLabel } = useLabels()
  const { data: formatsData, isLoading: isFormatsLoading } = useGetRestaurantFormatsQuery()
  const { data: cuisinesData, isLoading: isCuisinesLoading } = useGetCuisineTypesQuery()

  const formatOptions = useMemo(
    () =>
      (formatsData?.data ?? []).map(value => ({ value, label: getRestaurantFormatLabel(value) })),
    [formatsData, getRestaurantFormatLabel]
  )

  const toggleCuisine = (value: string) => {
    updateField(
      'cuisineTypes',
      formData.cuisineTypes.includes(value)
        ? formData.cuisineTypes.filter(item => item !== value)
        : [...formData.cuisineTypes, value]
    )
  }

  return (
    <>
      <Select
        label={t('profile.venueType')}
        value={formData.restaurantFormat}
        onChange={next => updateField('restaurantFormat', next)}
        options={formatOptions}
        placeholder={t('common.selectValue')}
        disabled={isLoading || isFormatsLoading || formatOptions.length === 0}
      />

      <FormField label={t('profile.cuisineTypesLabel')} hint={t('profile.cuisineTypesHint')}>
        <MultiSelectTagsList
          options={cuisinesData?.data ?? []}
          selectedValues={formData.cuisineTypes}
          onToggle={toggleCuisine}
          getLabel={getCuisineTypeLabel}
          getAriaLabel={(_value, label) => t('aria.selectType', { label })}
          disabled={isLoading}
          isLoading={isCuisinesLoading}
          emptyMessage={t('common.noOptions')}
          countLabel={count => t('profile.cuisineTypesCount', { count })}
        />
      </FormField>

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

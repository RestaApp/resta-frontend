import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import type { ApiRole } from '@/shared/types/roles.types'
import { BusinessAddressesField } from '../business-fields/BusinessAddressesField'
import { BusinessHoursField } from '../business-fields/BusinessHoursField'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { SupplierTypesField } from './SupplierTypesField'

interface BusinessFieldsSectionProps {
  apiRole: ApiRole | null
  formData: ProfileFormData
  isLoading: boolean
  supplierTypeOptions: string[]
  isSupplierTypesLoading: boolean
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/**
 * Поля бизнес‑роли (restaurant + supplier): supplier types (только supplier),
 * адреса, сайт, часы работы. SRP: только бизнес‑часть формы.
 */
export const BusinessFieldsSection = memo(
  ({
    apiRole,
    formData,
    isLoading,
    supplierTypeOptions,
    isSupplierTypesLoading,
    updateField,
  }: BusinessFieldsSectionProps) => {
    const { t } = useTranslation()

    return (
      <>
        {apiRole === 'supplier' && (
          <SupplierTypesField
            options={supplierTypeOptions}
            isLoading={isSupplierTypesLoading}
            selected={formData.supplierTypes}
            disabled={isLoading}
            onChange={next => updateField('supplierTypes', next)}
          />
        )}

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

        <BusinessHoursField
          value={formData.businessHours}
          disabled={isLoading}
          onChange={next => updateField('businessHours', next)}
        />
      </>
    )
  }
)
BusinessFieldsSection.displayName = 'BusinessFieldsSection'

import { memo, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Switch } from '@/components/ui/switch'
import { DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { BusinessAddressesField } from '../business-fields/BusinessAddressesField'
import { BusinessHoursField } from '../business-fields/BusinessHoursField'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EditProfileStepAbout } from './EditProfileStepAbout'
import { SupplierTypesField } from './SupplierTypesField'

interface EditProfileStepSupplierInfoProps {
  formData: ProfileFormData
  bioSuffix: string
  isLoading: boolean
  supplierTypeOptions: string[]
  isSupplierTypesLoading: boolean
  supplierTypesRef?: RefObject<HTMLDivElement | null>
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/** Шаг 3 для поставщика: типы, адреса, сайт, описание и заметки по графику. */
export const EditProfileStepSupplierInfo = memo(function EditProfileStepSupplierInfo({
  formData,
  bioSuffix,
  isLoading,
  supplierTypeOptions,
  isSupplierTypesLoading,
  supplierTypesRef,
  updateField,
}: EditProfileStepSupplierInfoProps) {
  const { t } = useTranslation()

  return (
    <>
      <SupplierTypesField
        options={supplierTypeOptions}
        isLoading={isSupplierTypesLoading}
        selected={formData.supplierTypes}
        disabled={isLoading}
        containerRef={supplierTypesRef}
        onChange={next => updateField('supplierTypes', next)}
      />

      <div className={DRAWER_SETTING_ROW_CLASS}>
        <div className="min-w-0">
          <p className={SHIFT_CARD_TITLE_CLASS}>{t('profile.deliveryAvailable')}</p>
          <p className={SHIFT_CARD_SUB_CLASS}>{t('profile.deliveryAvailableHint')}</p>
        </div>
        <Switch
          checked={formData.deliveryAvailable}
          disabled={isLoading}
          ariaLabel={t('profile.deliveryAvailable')}
          onCheckedChange={next => updateField('deliveryAvailable', next)}
        />
      </div>

      <BusinessAddressesField
        value={formData.location}
        disabled={isLoading}
        isRestaurant={false}
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

      <FormField label={t('profile.priceListUrl')} hint={t('profile.priceListUrlHint')}>
        <Input
          type="url"
          inputMode="url"
          autoComplete="url"
          value={formData.priceListUrl}
          onChange={e => updateField('priceListUrl', e.target.value)}
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

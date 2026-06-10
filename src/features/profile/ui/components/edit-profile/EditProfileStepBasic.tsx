import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { CitySelect } from '@/components/ui/city-select'
import type { ApiRole } from '@/shared/types/roles.types'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EditProfileAvatar } from './EditProfileAvatar'

interface EditProfileStepBasicProps {
  apiRole: ApiRole | null
  formData: ProfileFormData
  fieldErrors: Partial<Record<keyof ProfileFormData, string>>
  cities: string[]
  isCitiesLoading: boolean
  isLoading: boolean
  photoUrl?: string | null
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

export const EditProfileStepBasic = memo(function EditProfileStepBasic({
  apiRole,
  formData,
  fieldErrors,
  cities,
  isCitiesLoading,
  isLoading,
  photoUrl,
  updateField,
}: EditProfileStepBasicProps) {
  const { t } = useTranslation()
  const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
  const displayName =
    [formData.name, formData.lastName].filter(Boolean).join(' ').trim() || formData.name

  return (
    <>
      {apiRole === 'employee' ? <EditProfileAvatar photoUrl={photoUrl} name={displayName} /> : null}

      <FormField
        label={`${t('profile.nameLabel')} ${isBusinessRole ? t('profile.nameOrTitle') : ''}`.trim()}
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

      {apiRole === 'employee' ? (
        <FormField label={t('profile.surnameRequired')} required error={fieldErrors.lastName}>
          <Input
            value={formData.lastName}
            onChange={e => updateField('lastName', e.target.value)}
            placeholder={t('profile.form.surnamePlaceholder')}
            disabled={isLoading}
            aria-invalid={fieldErrors.lastName ? true : undefined}
          />
        </FormField>
      ) : null}

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
    </>
  )
})

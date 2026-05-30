import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { CitySelect } from '@/components/ui/city-select'
import type { ApiRole } from '@/shared/types/roles.types'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'

interface BasicProfileFieldsProps {
  apiRole: ApiRole | null
  formData: ProfileFormData
  fieldErrors: Partial<Record<keyof ProfileFormData, string>>
  cities: string[]
  isCitiesLoading: boolean
  isLoading: boolean
  bioSuffix: string
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/**
 * Универсальные поля профиля (имя, фамилия, описание, email, телефон, город).
 * Видимость отдельных полей зависит от `apiRole`.
 */
export const BasicProfileFields = memo(
  ({
    apiRole,
    formData,
    fieldErrors,
    cities,
    isCitiesLoading,
    isLoading,
    bioSuffix,
    updateField,
  }: BasicProfileFieldsProps) => {
    const { t } = useTranslation()
    const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'

    return (
      <>
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
      </>
    )
  }
)
BasicProfileFields.displayName = 'BasicProfileFields'

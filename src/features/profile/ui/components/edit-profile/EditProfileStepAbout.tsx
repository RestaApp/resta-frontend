import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'

interface EditProfileStepAboutProps {
  formData: ProfileFormData
  bioSuffix: string
  isLoading: boolean
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

export const EditProfileStepAbout = memo(function EditProfileStepAbout({
  formData,
  bioSuffix,
  isLoading,
  updateField,
}: EditProfileStepAboutProps) {
  const { t } = useTranslation()

  return (
    <>
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
    </>
  )
})

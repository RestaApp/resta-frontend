import { memo, useMemo, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { OpenToWorkButton } from '@/shared/ui/OpenToWorkButton'
import { RangeSlider } from '@/components/ui/range-slider'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/form-field'
import { Loader } from '@/components/ui/loader'
import { BLOCK_TITLE_CLASS, DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { formatExperienceText } from '@/shared/utils/experience'
import type { EmployeeSubRole } from '@/shared/types/roles.types'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EmployeeSpecializationsField } from './EmployeeSpecializationsField'

interface EditProfileStepProfessionalProps {
  formData: ProfileFormData
  fieldErrors: Partial<Record<keyof ProfileFormData, string>>
  experienceYearsValue: number
  positions: EmployeeSubRole[]
  isPositionsLoading: boolean
  specializationOptions: string[]
  isSpecializationsLoading: boolean
  specializationRef?: RefObject<HTMLDivElement | null>
  disabled: boolean
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

export const EditProfileStepProfessional = memo(function EditProfileStepProfessional({
  formData,
  fieldErrors,
  experienceYearsValue,
  positions,
  isPositionsLoading,
  specializationOptions,
  isSpecializationsLoading,
  specializationRef,
  disabled,
  updateField,
}: EditProfileStepProfessionalProps) {
  const { t } = useTranslation()

  const positionOptions = useMemo(
    () =>
      positions.map(position => ({
        value: position.originalValue || position.id,
        label: position.title,
      })),
    [positions]
  )

  const skillsList = useMemo(() => {
    const parts = formData.skills
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
  }, [formData.skills])

  const handlePositionChange = (nextPosition: string) => {
    updateField('position', nextPosition)
  }

  return (
    <>
      <FormField label={t('common.position')} required error={fieldErrors.position}>
        {isPositionsLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader size="sm" />
          </div>
        ) : (
          <Select
            value={formData.position}
            onChange={handlePositionChange}
            options={positionOptions}
            placeholder={t('common.selectValue')}
            disabled={disabled || positionOptions.length === 0}
            searchable={false}
            error={fieldErrors.position}
          />
        )}
      </FormField>

      <EmployeeSpecializationsField
        value={formData.specializations}
        options={specializationOptions}
        disabled={disabled || !formData.position}
        isLoading={isSpecializationsLoading}
        containerRef={specializationRef}
        onChange={next => updateField('specializations', next)}
      />
      {fieldErrors.specializations ? (
        <p className="-mt-2 text-sm text-destructive">{fieldErrors.specializations}</p>
      ) : null}

      <FormField label={t('profile.experienceYearsLabel')} required>
        <div className="mb-3">
          <span className={cn(BLOCK_TITLE_CLASS, 'text-gradient')}>
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

      <div className={DRAWER_SETTING_ROW_CLASS}>
        <div className="min-w-0">
          <p className={SHIFT_CARD_TITLE_CLASS}>{t('profile.openToWork')}</p>
          <p className={SHIFT_CARD_SUB_CLASS}>{t('profile.openToWorkDescription')}</p>
        </div>
        <OpenToWorkButton
          checked={formData.openToWork}
          disabled={disabled}
          variant="compact"
          onToggle={next => updateField('openToWork', next)}
        />
      </div>

      <FormField label={t('profile.skills')} hint={t('profile.skillsExample')}>
        <Textarea
          value={formData.skills}
          onChange={e => updateField('skills', e.target.value)}
          placeholder={t('profile.form.skillsPlaceholder')}
          disabled={disabled}
          rows={3}
          className="resize-none"
        />
        {skillsList.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {skillsList.map(skill => (
              <Badge key={skill} variant="tag">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </FormField>
    </>
  )
})

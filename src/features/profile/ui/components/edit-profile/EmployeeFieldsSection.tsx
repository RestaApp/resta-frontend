import { memo, type RefObject, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Textarea } from '@/components/ui/textarea'
import { OpenToWorkButton } from '@/shared/ui/OpenToWorkButton'
import { RangeSlider } from '@/components/ui/range-slider'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/form-field'
import { BLOCK_TITLE_CLASS, DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { formatExperienceText } from '@/shared/utils/experience'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EmployeeSpecializationsField } from './EmployeeSpecializationsField'

interface EmployeeFieldsSectionProps {
  experienceYearsValue: number
  openToWork: boolean
  skills: string
  specializations: string[]
  specializationOptions: string[]
  isSpecializationsLoading: boolean
  specializationRef?: RefObject<HTMLDivElement | null>
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
  disabled: boolean
}

/**
 * Поля профиля сотрудника: опыт (slider), open‑to‑work (строка с кнопкой), skills (textarea + chips).
 *
 * SRP: только поля для apiRole === 'employee'. Не знает про другие роли.
 */
export const EmployeeFieldsSection = memo(
  ({
    experienceYearsValue,
    openToWork,
    skills,
    specializations,
    specializationOptions,
    isSpecializationsLoading,
    specializationRef,
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
            checked={openToWork}
            disabled={disabled}
            variant="compact"
            onToggle={next => updateField('openToWork', next)}
          />
        </div>
        <EmployeeSpecializationsField
          value={specializations}
          options={specializationOptions}
          disabled={disabled}
          isLoading={isSpecializationsLoading}
          containerRef={specializationRef}
          onChange={next => updateField('specializations', next)}
        />
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

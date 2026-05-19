import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RangeSlider } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { FormField } from '@/components/ui/form-field'
import { BLOCK_TITLE_CLASS, DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
import { formatExperienceText } from '@/utils/experience'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'

interface EmployeeFieldsSectionProps {
  experienceYearsValue: number
  openToWork: boolean
  skills: string
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
  disabled: boolean
}

/**
 * Поля профиля сотрудника: опыт (slider), open‑to‑work (switch), skills (textarea + chips).
 *
 * SRP: только поля для apiRole === 'employee'. Не знает про другие роли.
 */
export const EmployeeFieldsSection = memo(
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
          <div>
            <p className="block text-sm font-medium mb-1">{t('profile.openToWork')}</p>
            <p className="text-xs text-muted-foreground">{t('profile.openToWorkDescription')}</p>
          </div>
          <Switch
            checked={openToWork}
            onCheckedChange={checked => updateField('openToWork', checked)}
            disabled={disabled}
          />
        </div>
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

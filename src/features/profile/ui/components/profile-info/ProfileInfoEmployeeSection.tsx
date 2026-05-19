import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { EmployeeProfile } from '@/services/api/authApi'
import { formatExperienceText } from '@/utils/experience'
import { InfoRow, LABEL_CLASS, ROW_CLASS } from './InfoRow'
import { splitSkillByDots } from './skills'

interface ProfileInfoEmployeeSectionProps {
  employeeProfile: EmployeeProfile | null
}

/**
 * SRP: рендер employee‑полей профиля (опыт, open‑to‑work, skills).
 * Не знает про userProfile целиком — только про employeeProfile.
 */
export const ProfileInfoEmployeeSection = memo(
  ({ employeeProfile }: ProfileInfoEmployeeSectionProps) => {
    const { t } = useTranslation()
    if (!employeeProfile) return null
    const { experience_years, open_to_work, skills } = employeeProfile
    const hasExperience = experience_years !== undefined
    const hasOpenToWork = open_to_work !== undefined
    const skillsList = Array.isArray(skills) ? skills.map(s => s.trim()).filter(Boolean) : []
    const preparedSkills = skillsList.flatMap(splitSkillByDots)
    const hasSkills = skillsList.length > 0
    if (!hasExperience && !hasOpenToWork && !hasSkills) return null

    return (
      <>
        {hasExperience && (
          <InfoRow label={t('profile.experience')}>
            {formatExperienceText(experience_years)}
          </InfoRow>
        )}
        {hasOpenToWork && (
          <InfoRow label={t('profile.openToWork')}>
            {open_to_work ? t('common.yes') : t('common.no')}
          </InfoRow>
        )}
        {hasSkills && (
          <div
            className={cn(
              ROW_CLASS,
              'flex-col items-start justify-start gap-2 sm:flex-row sm:items-start sm:justify-between'
            )}
          >
            <span className={cn(LABEL_CLASS, 'min-w-0 sm:min-w-32')}>{t('profile.skills')}</span>
            <div className="flex w-full flex-wrap justify-end gap-2 min-w-0">
              {preparedSkills.map((skill, index) => (
                <Badge key={`${skill}-${index}`} variant="tag">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </>
    )
  }
)
ProfileInfoEmployeeSection.displayName = 'ProfileInfoEmployeeSection'

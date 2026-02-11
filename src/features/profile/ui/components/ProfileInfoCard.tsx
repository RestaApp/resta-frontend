import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { ApiRole } from '@/types'
import type { UserData, EmployeeProfile } from '@/services/api/authApi'
import { formatExperienceText } from '@/utils/experience'
import { getProfileCompleteness } from '../../model/utils/profileCompleteness'
import { useProfileFormLabels } from '@/shared/i18n/hooks'

type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

const ROW_CLASS = 'flex justify-between items-baseline gap-3 py-2.5'
const LABEL_CLASS = 'text-muted-foreground shrink-0 min-w-[8rem]'
const VALUE_CLASS = 'font-medium text-foreground text-right min-w-0'
const VALUE_LINK_CLASS = 'font-medium text-primary text-right truncate hover:underline min-w-0'

interface InfoRowProps {
  label: string
  children: ReactNode
  href?: string
  valueClassName?: string
}

const InfoRow = memo(({ label, children, href, valueClassName = VALUE_CLASS }: InfoRowProps) => (
  <div className={ROW_CLASS}>
    <span className={LABEL_CLASS}>{label}</span>
    {href ? (
      <a
        href={href}
        className={cn(valueClassName, 'min-w-0 truncate')}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </a>
    ) : (
      <span
        className={cn(valueClassName, 'min-w-0 truncate')}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
    )}
  </div>
))
InfoRow.displayName = 'InfoRow'

interface ProfileInfoEmployeeSectionProps {
  employeeProfile: EmployeeProfile | null
}

const ProfileInfoEmployeeSection = memo(({ employeeProfile }: ProfileInfoEmployeeSectionProps) => {
  const { t } = useTranslation()
  if (!employeeProfile) return null
  const { experience_years, open_to_work, skills } = employeeProfile
  const hasExperience = experience_years !== undefined
  const hasOpenToWork = open_to_work !== undefined
  const hasSkills = skills?.length

  if (!hasExperience && !hasOpenToWork && !hasSkills) return null

  return (
    <>
      {hasExperience && (
        <InfoRow label={t('profile.experience')}>{formatExperienceText(experience_years)}</InfoRow>
      )}
      {hasOpenToWork && (
        <InfoRow label={t('profile.openToWork')}>
          {open_to_work ? t('common.yes') : t('common.no')}
        </InfoRow>
      )}
      {hasSkills ? (
        <div className="pt-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2">
            {t('profile.skills')}
          </span>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span
                key={skill}
                title={skill}
                className="inline-flex items-start max-w-full px-3 py-1.5 rounded-xl text-xs font-medium leading-snug break-words bg-primary/10 text-primary border border-primary/20 sm:max-w-[18rem]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
})
ProfileInfoEmployeeSection.displayName = 'ProfileInfoEmployeeSection'

interface ProfileInfoCardProps {
  userProfile: UserData
  apiRole: ApiRole | null
  completeness: ProfileCompleteness | null
  onFill: () => void
}

export const ProfileInfoCard = memo(
  ({ userProfile, apiRole, completeness, onFill }: ProfileInfoCardProps) => {
    const { t } = useTranslation()
    const { getWorkSummaryLabel } = useProfileFormLabels()
    const isFilled = completeness?.isFilled ?? false
    const cityOrLocation = userProfile.city ?? userProfile.location
    const workSummaryLabel = getWorkSummaryLabel(apiRole)

    return (
      <Card className="p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h4 className="text-base font-semibold text-foreground">{t('profile.personalInfo')}</h4>
          {isFilled ? (
            <Badge
              variant="success"
              className="flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('common.filled')}
            </Badge>
          ) : (
            <button
              type="button"
              onClick={onFill}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {t('common.needToFill')}
            </button>
          )}
        </div>
        <div className="space-y-0 text-sm">
          {!isFilled ? (
            <div className="text-center py-6 px-2">
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {t('profile.fillToApply')}
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onFill}
                className="px-5 py-2.5 rounded-2xl text-sm font-medium text-white gradient-primary shadow-sm"
              >
                {t('common.fill')}
              </motion.button>
            </div>
          ) : (
            <>
              {userProfile.bio && (
                <div className="pb-3 border-b border-border/50">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                    {t('common.description')}
                  </span>
                  <p className="text-foreground leading-relaxed break-words">{userProfile.bio}</p>
                </div>
              )}
              <div className="divide-y divide-border/50">
                {cityOrLocation && (
                  <InfoRow label={t('profile.city')} valueClassName={`${VALUE_CLASS} truncate`}>
                    {cityOrLocation}
                  </InfoRow>
                )}
                {apiRole === 'employee' && userProfile.last_name && (
                  <InfoRow label={t('profile.surname')}>{userProfile.last_name}</InfoRow>
                )}
                {userProfile.email && (
                  <InfoRow
                    label={t('profile.email')}
                    href={`mailto:${userProfile.email}`}
                    valueClassName={VALUE_LINK_CLASS}
                  >
                    {userProfile.email}
                  </InfoRow>
                )}
                {userProfile.phone && (
                  <InfoRow label={t('profile.phone')} href={`tel:${userProfile.phone}`}>
                    {userProfile.phone}
                  </InfoRow>
                )}
                {userProfile.work_experience_summary && (
                  <div className="py-2.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                      {workSummaryLabel}
                    </span>
                    <p className="text-foreground leading-relaxed">
                      {userProfile.work_experience_summary}
                    </p>
                  </div>
                )}
                {apiRole === 'employee' && (
                  <ProfileInfoEmployeeSection employeeProfile={userProfile.employee_profile} />
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    )
  }
)
ProfileInfoCard.displayName = 'ProfileInfoCard'

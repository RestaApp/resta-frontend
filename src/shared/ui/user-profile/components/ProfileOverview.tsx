import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiRow } from '@/components/ui/kpi-row'
import type { ProfileViewModel } from '../buildProfileViewModel'
import { ProfileHero } from './ProfileHero'
import { ProfileOpenToWorkCard } from './profileOverviewPrimitives'
import {
  ProfileReviewSummary,
  ProfileTagSectionView,
  ProfileWorkHistoryView,
} from './profileOverviewSectionViews'
import { ProfileInfoSectionView, type ProfileContactType } from './profileOverviewInfoSection'

export type { ProfileContactType } from './profileOverviewInfoSection'

interface ProfileOverviewProps {
  profile: ProfileViewModel
  variant?: 'page' | 'drawer'
  onFill?: () => void
  onEditSpecializations?: () => void
  onEditSupplierTypes?: () => void
  onOpenToWorkToggle?: (nextValue: boolean) => void
  isOpenToWorkUpdating?: boolean
  /** Трек клика по контакту/прайсу (только для чужих профилей). */
  onContactClick?: (type: ProfileContactType) => void
}

export const ProfileOverview = memo(function ProfileOverview({
  profile,
  variant = 'page',
  onFill,
  onEditSpecializations,
  onEditSupplierTypes,
  onOpenToWorkToggle,
  isOpenToWorkUpdating = false,
  onContactClick,
}: ProfileOverviewProps) {
  const { t } = useTranslation()
  const showFillAction = !profile.isProfileFilled && Boolean(onFill)
  const isEmployee = profile.apiRole === 'employee'
  const isOpenToWork = profile.userProfile.employee_profile?.open_to_work === true

  return (
    <div className={variant === 'drawer' ? 'ui-density-stack' : 'flex flex-col gap-3'}>
      <ProfileHero
        userProfile={profile.userProfile}
        userName={profile.userName}
        roleLabel={profile.roleLabel}
      />

      <ProfileOpenToWorkCard
        visible={isEmployee && Boolean(onOpenToWorkToggle)}
        checked={isOpenToWork}
        disabled={isOpenToWorkUpdating}
        onToggle={onOpenToWorkToggle}
      />

      {!profile.isProfileFilled ? (
        <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 text-center">
          <p className="text-sm leading-relaxed text-foreground/80">{profile.fillRequiredText}</p>
          {showFillAction ? (
            <div className="flex justify-center">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onFill}
                  variant="gradient"
                  size="md"
                  className="min-w-39"
                  type="button"
                >
                  {t('common.fill')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          ) : null}
        </div>
      ) : null}

      {profile.kpis.length > 0 ? (
        <KpiRow
          items={profile.kpis}
          className="gap-2"
          itemClassName="rounded-lg border-border bg-card px-3 py-3"
        />
      ) : null}

      {profile.analyticsKpis.length > 0 ? (
        <KpiRow
          items={profile.analyticsKpis}
          className="gap-2"
          itemClassName="rounded-lg border-border bg-card px-3 py-3"
        />
      ) : null}

      {profile.tagSections.map(section => (
        <ProfileTagSectionView
          key={section.id}
          section={section}
          onEdit={
            variant === 'page' && section.id === 'employee-specializations'
              ? onEditSpecializations
              : variant === 'page' && section.id === 'supplier-types'
                ? onEditSupplierTypes
                : undefined
          }
          editAriaLabel={
            section.id === 'employee-specializations'
              ? t('aria.editSpecializations')
              : section.id === 'supplier-types'
                ? t('aria.editSupplierTypes')
                : undefined
          }
        />
      ))}

      <ProfileWorkHistoryView items={profile.workHistory} variant={variant} />

      <ProfileReviewSummary profile={profile} />

      {profile.infoSections.map(section => (
        <ProfileInfoSectionView
          key={section.id}
          section={section}
          variant={variant}
          onContactClick={onContactClick}
        />
      ))}
    </div>
  )
})

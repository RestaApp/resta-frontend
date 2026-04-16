import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileHero } from './components/ProfileHero'
import { ProfileInfoCard } from './components/ProfileInfoCard'
import { ProfileSettings } from './components/ProfileSettings'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { NotificationPreferencesDrawer } from './components/NotificationPreferencesDrawer'
import { ProfileBusinessInfoCard } from './components/ProfileBusinessInfoCard'
import { ProfileSpecializationsSection } from './components/ProfileSpecializationsSection'
import { ProfileSupplierCategorySection } from './components/ProfileSupplierCategorySection'
import { Loader } from '@/components/ui/loader'
import { Card } from '@/components/ui/card'
import { Award } from 'lucide-react'
import { buildProfileAchievements } from './utils/profileAchievements'

export const ProfilePage = memo(() => {
  const { t } = useTranslation()
  const m = useProfilePageModel()

  const achievements = useMemo(() => {
    if (m.apiRole === 'supplier') return []
    return buildProfileAchievements({
      t,
      apiRole: m.apiRole,
      completedShifts: m.employeeStats?.completedShifts ?? 0,
      activeApplications: m.employeeStats?.activeApplications ?? 0,
      myShiftsCount: m.myShiftsCount,
      appliedShiftsCount: m.appliedShiftsCount,
      isProfileFilled: m.profileCompleteness?.isFilled ?? false,
      infoPercent: m.profileCompleteness?.infoPercent ?? 0,
      specializationsCount: m.specializations.length,
    })
  }, [
    m.apiRole,
    m.employeeStats?.activeApplications,
    m.employeeStats?.completedShifts,
    m.myShiftsCount,
    m.appliedShiftsCount,
    m.profileCompleteness?.isFilled,
    m.profileCompleteness?.infoPercent,
    m.specializations.length,
    t,
  ])

  if (m.isProfileLoading) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader size="lg" />
        </div>
      </div>
    )
  }

  if (!m.userProfile) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <div className="text-center py-8 text-destructive">{t('profile.loadError')}</div>
      </div>
    )
  }

  return (
    <div className="pb-4 pt-2 ui-density-page ui-density-stack-lg">
      <ProfileHero
        userProfile={m.userProfile}
        userName={m.userName}
        roleLabel={m.roleLabel}
        apiRole={m.apiRole}
        isProfileFilled={m.profileCompleteness?.isFilled ?? false}
        onFillProfile={
          m.profileCompleteness?.isFilled ? undefined : () => m.setIsEditDrawerOpen(true)
        }
      />

      {m.apiRole === 'employee' && (
        <ProfileSpecializationsSection specializations={m.specializations} />
      )}
      {m.apiRole === 'supplier' && <ProfileSupplierCategorySection category={m.supplierCategory} />}
      <ProfileInfoCard
        apiRole={m.apiRole}
        userProfile={m.userProfile}
        completeness={m.profileCompleteness}
        onFill={() => m.setIsEditDrawerOpen(true)}
      />

      {m.apiRole === 'supplier' && m.supplierInfo ? (
        <ProfileBusinessInfoCard kind="supplier" value={m.supplierInfo.name} />
      ) : null}

      {m.apiRole !== 'supplier' ? (
        <div>
          <h3 className="text-lg font-semibold ui-density-mb flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
            {t('profile.achievements')}
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
            {achievements.map((a, index) => (
              <motion.div
                key={a.id}
                className="flex-shrink-0 snap-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="flex h-[125px] w-[125px] flex-col items-center justify-center gap-2 p-3 text-center">
                  <div className="text-3xl leading-none">{a.emoji}</div>
                  <div className="text-sm font-medium leading-tight">{a.title}</div>
                  <p className="text-xs text-muted-foreground leading-tight">{a.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

      <ProfileSettings
        onLogout={m.handleLogout}
        onNotificationSettingsClick={() => m.setIsNotificationPrefsDrawerOpen(true)}
        showNotificationSettings={m.apiRole !== 'supplier'}
        showSupport={m.apiRole != null && m.apiRole !== 'unverified'}
      />

      <EditProfileDrawer
        open={m.isEditDrawerOpen}
        onOpenChange={m.setIsEditDrawerOpen}
        onSuccess={() => {
          m.setIsEditDrawerOpen(false)
          void m.handleEditSuccess()
        }}
      />

      {m.apiRole !== 'supplier' ? (
        <NotificationPreferencesDrawer
          open={m.isNotificationPrefsDrawerOpen}
          onOpenChange={m.setIsNotificationPrefsDrawerOpen}
          apiRole={m.apiRole}
        />
      ) : null}
    </div>
  )
})
ProfilePage.displayName = 'ProfilePage'

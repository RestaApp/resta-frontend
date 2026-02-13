import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useLabels } from '@/shared/i18n/hooks'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileHero } from './components/ProfileHero'
import { ProfileStats } from './components/ProfileStats'
import { ProfileInfoCard } from './components/ProfileInfoCard'
import { ProfileSettings } from './components/ProfileSettings'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { NotificationPreferencesDrawer } from './components/NotificationPreferencesDrawer'
import { Loader } from '@/components/ui/loader'
import { Card } from '@/components/ui/card'
import { Award } from 'lucide-react'
import { buildProfileAchievements } from './utils/profileAchievements'

const SpecializationsSection = memo(({ specializations }: { specializations: string[] }) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  if (specializations.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('profile.specializationSection')}</h3>
      <div className="flex flex-wrap gap-2">
        {specializations.map((spec: string) => (
          <span key={spec} className="px-4 py-2 rounded-full text-white text-sm gradient-primary">
            {getSpecializationLabel(spec)}
          </span>
        ))}
      </div>
    </div>
  )
})
SpecializationsSection.displayName = 'SpecializationsSection'

const RestaurantInfoCard = memo(
  ({ restaurantInfo }: { restaurantInfo: { name: string; format: string | null } }) => {
    const { t } = useTranslation()
    return (
      <Card className="p-5">
        <h4 className="font-semibold mb-3">{t('roles.venueInfoTitle')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.venueName')}</span>
            <span>{restaurantInfo.name}</span>
          </div>
          {restaurantInfo.format && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('profile.venueType')}</span>
              <span>{restaurantInfo.format}</span>
            </div>
          )}
        </div>
      </Card>
    )
  }
)
RestaurantInfoCard.displayName = 'RestaurantInfoCard'

const SupplierInfoCard = memo(({ supplierInfo }: { supplierInfo: { name: string } }) => {
  const { t } = useTranslation()
  return (
    <Card className="p-5">
      <h4 className="font-semibold mb-3">{t('roles.supplierInfoTitle')}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('profile.companyName')}</span>
          <span>{supplierInfo.name}</span>
        </div>
      </div>
    </Card>
  )
})
SupplierInfoCard.displayName = 'SupplierInfoCard'

export const ProfilePage = memo(() => {
  const { t } = useTranslation()
  const m = useProfilePageModel()

  const achievements = useMemo(() => {
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
      <div className="pb-24 pt-6 px-4">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader size="lg" />
        </div>
      </div>
    )
  }

  if (!m.userProfile) {
    return (
      <div className="pb-24 pt-6 px-4">
        <div className="text-center py-8 text-destructive">{t('profile.loadError')}</div>
      </div>
    )
  }

  return (
    <div className="pb-4 pt-6 px-4 space-y-6">
      <ProfileHero
        userProfile={m.userProfile}
        userName={m.userName}
        roleLabel={m.roleLabel}
        apiRole={m.apiRole}
        isProfileFilled={m.profileCompleteness?.isFilled ?? false}
        onEdit={() => m.setIsEditDrawerOpen(true)}
      />

      <ProfileStats
        apiRole={m.apiRole}
        employeeStats={m.employeeStats}
        myShiftsCount={m.myShiftsCount}
        appliedShiftsCount={m.appliedShiftsCount}
      />

      {m.apiRole === 'employee' && <SpecializationsSection specializations={m.specializations} />}
      <ProfileInfoCard
        apiRole={m.apiRole}
        userProfile={m.userProfile}
        completeness={m.profileCompleteness}
        onFill={() => m.setIsEditDrawerOpen(true)}
      />

      {m.apiRole === 'restaurant' && m.restaurantInfo ? (
        <RestaurantInfoCard restaurantInfo={m.restaurantInfo} />
      ) : null}

      {m.apiRole === 'supplier' && m.supplierInfo ? (
        <SupplierInfoCard supplierInfo={m.supplierInfo} />
      ) : null}

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: 'var(--pink-electric)' }} />
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
              <Card className="flex h-[125px] w-[125px] flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="text-3xl leading-none">{a.emoji}</div>
                <div className="text-sm font-medium leading-tight">{a.title}</div>
                <p className="text-xs text-muted-foreground leading-tight">{a.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <ProfileSettings
        onLogout={m.handleLogout}
        onNotificationSettingsClick={() => m.setIsNotificationPrefsDrawerOpen(true)}
      />

      <EditProfileDrawer
        open={m.isEditDrawerOpen}
        onOpenChange={m.setIsEditDrawerOpen}
        onSuccess={() => {
          m.setIsEditDrawerOpen(false)
        }}
      />

      <NotificationPreferencesDrawer
        open={m.isNotificationPrefsDrawerOpen}
        onOpenChange={m.setIsNotificationPrefsDrawerOpen}
      />
    </div>
  )
})
ProfilePage.displayName = 'ProfilePage'

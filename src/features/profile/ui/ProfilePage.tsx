import { memo } from 'react'
import { getSpecializationLabel } from '@/constants/labels'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileStats } from './components/ProfileStats'
import { ProfileInfoCard } from './components/ProfileInfoCard'
import { ProfileSettings } from './components/ProfileSettings'
import { EditProfileDrawer } from './components/EditProfileDrawer'

const SpecializationsSection = memo(({ specializations }: { specializations: string[] }) => {
  if (specializations.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Специализация</h3>
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

const RestaurantInfoCard = memo(({ restaurantInfo }: { restaurantInfo: { name: string; format: string | null } }) => {
  return (
    <div className="p-4 border border-border rounded-xl">
      <h4 className="font-semibold mb-3">Информация о заведении</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Название</span>
          <span>{restaurantInfo.name}</span>
        </div>
        {restaurantInfo.format && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Тип</span>
            <span>{restaurantInfo.format}</span>
          </div>
        )}
      </div>
    </div>
  )
})
RestaurantInfoCard.displayName = 'RestaurantInfoCard'

const SupplierInfoCard = memo(({ supplierInfo }: { supplierInfo: { name: string } }) => {
  return (
    <div className="p-4 border border-border rounded-xl">
      <h4 className="font-semibold mb-3">Информация о компании</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Компания</span>
          <span>{supplierInfo.name}</span>
        </div>
      </div>
    </div>
  )
})
SupplierInfoCard.displayName = 'SupplierInfoCard'

export const ProfilePage = memo(() => {
  const m = useProfilePageModel()

  if (m.isProfileLoading) {
    return (
      <div className="pb-24 pt-6 px-4">
        <div className="text-center py-8 text-muted-foreground">Загрузка профиля...</div>
      </div>
    )
  }

  if (!m.userProfile) {
    return (
      <div className="pb-24 pt-6 px-4">
        <div className="text-center py-8 text-destructive">Ошибка загрузки профиля</div>
      </div>
    )
  }

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <ProfileHeader
        userProfile={m.userProfile}
        userName={m.userName}
        roleLabel={m.roleLabel}
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

      {m.apiRole === 'restaurant' && m.restaurantInfo && <RestaurantInfoCard restaurantInfo={m.restaurantInfo} />}

      {m.apiRole === 'supplier' && m.supplierInfo && <SupplierInfoCard supplierInfo={m.supplierInfo} />}

      <ProfileSettings onLogout={m.handleLogout} />

      <EditProfileDrawer
        open={m.isEditDrawerOpen}
        onOpenChange={m.setIsEditDrawerOpen}
        onSuccess={() => m.refetch()}
      />
    </div>
  )
})
ProfilePage.displayName = 'ProfilePage'

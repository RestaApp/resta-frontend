import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileOverview } from './components/ProfileOverview'
import { ProfileSettings } from './components/ProfileSettings'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { NotificationPreferencesDrawer } from './components/NotificationPreferencesDrawer'
import { Loader } from '@/components/ui/loader'
import { ErrorState } from '@/components/ui/states'

export const ProfilePage = memo(() => {
  const { t } = useTranslation()
  const m = useProfilePageModel()

  if (m.isProfileLoading) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader size="lg" />
        </div>
      </div>
    )
  }

  if (!m.userProfile || !m.profileViewModel) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <ErrorState title={t('profile.loadError')} />
      </div>
    )
  }

  return (
    <div className="pb-4 pt-2 ui-density-page ui-density-stack-lg">
      <ProfileOverview
        profile={m.profileViewModel}
        onFill={() => m.setIsEditDrawerOpen(true)}
        onOpenToWorkToggle={m.handleOpenToWorkToggle}
        isOpenToWorkUpdating={m.isUpdatingUser}
      />

      <ProfileSettings
        onLogout={m.handleLogout}
        onNotificationSettingsClick={() => m.setIsNotificationPrefsDrawerOpen(true)}
        showNotificationSettings={m.profileViewModel.showNotificationSettings}
        showSupport={m.profileViewModel.showSupport}
      />

      <EditProfileDrawer
        open={m.isEditDrawerOpen}
        onOpenChange={m.setIsEditDrawerOpen}
        onSuccess={() => {
          m.setIsEditDrawerOpen(false)
          void m.handleEditSuccess()
        }}
      />

      {m.profileViewModel.showNotificationSettings ? (
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

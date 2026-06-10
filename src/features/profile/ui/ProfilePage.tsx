import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileOverview } from '@/shared/ui/user-profile/components/ProfileOverview'
import { VenueProfileOverview } from './components/VenueProfileOverview'
import { ProfileSettings } from './components/ProfileSettings'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { NotificationPreferencesDrawer } from './components/NotificationPreferencesDrawer'
import { PrivacyPolicyPage } from '@/shared/ui/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/shared/ui/legal/TermsOfServicePage'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { ErrorState } from '@/components/ui/states'

type LegalScreen = 'none' | 'privacy' | 'terms'

export const ProfilePage = memo(() => {
  const { t } = useTranslation()
  const m = useProfilePageModel()
  const [legalScreen, setLegalScreen] = useState<LegalScreen>('none')
  const [editProfileSection, setEditProfileSection] = useState<
    'specializations' | 'supplierTypes' | null
  >(null)

  const handleLegalBack = useCallback(() => {
    setLegalScreen('none')
    resetAppScroll()
  }, [])

  const handleEditSpecializations = useCallback(() => {
    setEditProfileSection('specializations')
    m.setIsEditDrawerOpen(true)
  }, [m])

  const handleEditSupplierTypes = useCallback(() => {
    setEditProfileSection('supplierTypes')
    m.setIsEditDrawerOpen(true)
  }, [m])

  if (legalScreen === 'privacy') {
    return <PrivacyPolicyPage onBack={handleLegalBack} />
  }

  if (legalScreen === 'terms') {
    return <TermsOfServicePage onBack={handleLegalBack} />
  }

  if (m.isProfileLoading) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <ProfileSkeleton variant="page" />
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
    <div className="pb-4 pt-2 ui-density-page ui-density-stack">
      {m.apiRole === 'restaurant' ? (
        <VenueProfileOverview
          profile={m.profileViewModel}
          infoRows={m.venueInfoRows}
          openShiftsCount={m.venueOpenShiftsCount}
          hiresCount={m.venueHiresCount}
          onFill={() => m.setIsEditDrawerOpen(true)}
        />
      ) : (
        <ProfileOverview
          profile={m.profileViewModel}
          onFill={() => m.setIsEditDrawerOpen(true)}
          onEditSpecializations={handleEditSpecializations}
          onEditSupplierTypes={handleEditSupplierTypes}
          onOpenToWorkToggle={m.handleOpenToWorkToggle}
          isOpenToWorkUpdating={m.isUpdatingUser}
        />
      )}

      <ProfileSettings
        onLogout={m.handleLogout}
        onNotificationSettingsClick={() => m.setIsNotificationPrefsDrawerOpen(true)}
        showNotificationSettings={m.profileViewModel.showNotificationSettings}
        showSupport={m.profileViewModel.showSupport}
        onPrivacyPress={() => setLegalScreen('privacy')}
        onTermsPress={() => setLegalScreen('terms')}
        onDeleteAccount={m.handleDeleteAccount}
      />

      <EditProfileDrawer
        open={m.isEditDrawerOpen}
        onOpenChange={open => {
          m.setIsEditDrawerOpen(open)
          if (!open) setEditProfileSection(null)
        }}
        initialSection={editProfileSection}
        onSuccess={() => {
          setEditProfileSection(null)
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

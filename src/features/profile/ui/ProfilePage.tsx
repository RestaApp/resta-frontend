import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { useProfilePageModel } from '../model/hooks/useProfilePageModel'
import { ProfileOverview } from '@/shared/ui/user-profile/components/ProfileOverview'
import { VenueProfileOverview } from './components/VenueProfileOverview'
import { ProfileSettings } from './components/ProfileSettings'
import { SubscriptionCard } from '@/features/monetization/ui/SubscriptionCard'
import { SupplierAnalyticsCard } from '@/features/monetization/ui/SupplierAnalyticsCard'
import { EditProfileDrawer } from './components/EditProfileDrawer'
import { NotificationPreferencesDrawer } from './components/NotificationPreferencesDrawer'
import { PrivacyPolicyPage } from '@/shared/ui/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/shared/ui/legal/TermsOfServicePage'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { ErrorState } from '@/components/ui/states'

type LegalScreen = 'none' | 'privacy' | 'terms'

export const ProfilePage = memo(() => {
  const { t } = useTranslation()
  const {
    userProfile,
    isProfileLoading,
    apiRole,
    profileViewModel,
    venueInfoRows,
    venueOpenShiftsCount,
    venueHiresCount,
    isEditDrawerOpen,
    setIsEditDrawerOpen,
    isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen,
    isUpdatingUser,
    handleOpenToWorkToggle,
    handleLogout,
    handleDeleteAccount,
  } = useProfilePageModel()
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
    setIsEditDrawerOpen(true)
  }, [setIsEditDrawerOpen])

  const handleEditSupplierTypes = useCallback(() => {
    setEditProfileSection('supplierTypes')
    setIsEditDrawerOpen(true)
  }, [setIsEditDrawerOpen])

  if (legalScreen === 'privacy') {
    return <PrivacyPolicyPage onBack={handleLegalBack} />
  }

  if (legalScreen === 'terms') {
    return <TermsOfServicePage onBack={handleLegalBack} />
  }

  if (isProfileLoading) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <ProfileSkeleton variant="page" />
      </div>
    )
  }

  if (!userProfile || !profileViewModel) {
    return (
      <div className="pb-24 ui-density-page ui-density-py">
        <ErrorState title={t('profile.loadError')} />
      </div>
    )
  }

  return (
    <div className="pb-4 pt-2 ui-density-page ui-density-stack">
      {apiRole === 'restaurant' ? (
        <VenueProfileOverview
          profile={profileViewModel}
          infoRows={venueInfoRows}
          openShiftsCount={venueOpenShiftsCount}
          hiresCount={venueHiresCount}
          onFill={() => setIsEditDrawerOpen(true)}
        />
      ) : (
        <ProfileOverview
          profile={profileViewModel}
          onFill={() => setIsEditDrawerOpen(true)}
          onEditSpecializations={handleEditSpecializations}
          onEditSupplierTypes={handleEditSupplierTypes}
          onOpenToWorkToggle={handleOpenToWorkToggle}
          isOpenToWorkUpdating={isUpdatingUser}
        />
      )}

      {apiRole === 'supplier' ? <SubscriptionCard /> : null}

      <SupplierAnalyticsCard isSupplier={apiRole === 'supplier'} />

      <ProfileSettings
        onLogout={handleLogout}
        onNotificationSettingsClick={() => setIsNotificationPrefsDrawerOpen(true)}
        showNotificationSettings={profileViewModel.showNotificationSettings}
        showSupport={profileViewModel.showSupport}
        onPrivacyPress={() => setLegalScreen('privacy')}
        onTermsPress={() => setLegalScreen('terms')}
        onDeleteAccount={handleDeleteAccount}
      />

      <EditProfileDrawer
        open={isEditDrawerOpen}
        onOpenChange={open => {
          setIsEditDrawerOpen(open)
          if (!open) setEditProfileSection(null)
        }}
        initialSection={editProfileSection}
        onSuccess={() => {
          setEditProfileSection(null)
          setIsEditDrawerOpen(false)
        }}
      />

      {profileViewModel.showNotificationSettings ? (
        <NotificationPreferencesDrawer
          open={isNotificationPrefsDrawerOpen}
          onOpenChange={setIsNotificationPrefsDrawerOpen}
          apiRole={apiRole}
        />
      ) : null}
    </div>
  )
})
ProfilePage.displayName = 'ProfilePage'

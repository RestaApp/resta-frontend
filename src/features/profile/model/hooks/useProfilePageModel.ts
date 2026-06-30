import { useProfileViewModelData } from './useProfileViewModelData'
import { useProfileDrawersState } from './useProfileDrawersState'
import { useProfileAccountActions } from './useProfileAccountActions'

/**
 * Модель страницы профиля. Тонкий оркестратор над sub-hooks:
 *  • `useProfileViewModelData`   — data + сборка `profileViewModel` и venue-метрик;
 *  • `useProfileDrawersState`    — UI-state дроверов;
 *  • `useProfileAccountActions`  — выход / удаление / open_to_work.
 * Public API (форма возврата) сохранён 1:1 — потребитель `ProfilePage` не меняется.
 */
export const useProfilePageModel = () => {
  const data = useProfileViewModelData()
  const drawers = useProfileDrawersState()
  const actions = useProfileAccountActions({
    userProfile: data.userProfile,
    apiRole: data.apiRole,
  })

  return {
    userProfile: data.userProfile,
    isProfileLoading: data.isProfileLoading,

    apiRole: data.apiRole,
    profileViewModel: data.profileViewModel,
    venueInfoRows: data.venueInfoRows,
    venueOpenShiftsCount: data.venueOpenShiftsCount,
    venueHiresCount: data.venueHiresCount,

    isEditDrawerOpen: drawers.isEditDrawerOpen,
    setIsEditDrawerOpen: drawers.setIsEditDrawerOpen,

    isNotificationPrefsDrawerOpen: drawers.isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen: drawers.setIsNotificationPrefsDrawerOpen,

    isUpdatingUser: actions.isUpdatingUser,
    handleOpenToWorkToggle: actions.handleOpenToWorkToggle,
    handleLogout: actions.handleLogout,
    handleDeleteAccount: actions.handleDeleteAccount,
  } as const
}

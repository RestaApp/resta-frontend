import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/store/slices/userSlice'
import { useStaffApplicationsData } from './useStaffApplicationsData'
import { useStaffApplicationActions } from './useStaffApplicationActions'
import { useStaffApplicantOverlays } from './useStaffApplicantOverlays'

/**
 * Контроллер экрана откликов сотрудников. Тонкий оркестратор над sub-hooks:
 *  • `useStaffApplicationsData`   — загрузка списка + производные;
 *  • `useStaffApplicationActions` — accept/reject (мутации);
 *  • `useStaffApplicantOverlays`  — оверлеи профиля соискателя и деталей смены.
 * Public API (форма возврата) сохранён 1:1 — потребитель `VenueStaffPage` не меняется.
 */
export const useStaffApplicationsController = () => {
  const userData = useAppSelector(selectUserData)
  const ownerPhotoUrl = userData?.photo_url ?? userData?.profile_photo_url ?? null
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)

  const {
    isApplicationsLoading,
    isApplicationsError,
    refetchApplications,
    pendingApplicationsCount,
    staffItems,
  } = useStaffApplicationsData()

  const { handleAccept, handleReject, isAccepting, isRejecting, acceptingApplicationId } =
    useStaffApplicationActions()

  const overlays = useStaffApplicantOverlays({
    staffItems,
    ownerPhotoUrl,
    handleAccept,
    handleReject,
    refetchApplications,
  })

  return {
    isApplicationsOpen,
    setIsApplicationsOpen,
    isApplicationsLoading,
    isApplicationsError,
    pendingApplicationsCount,
    staffItems,
    isAccepting,
    isRejecting,
    acceptingApplicationId,
    handleAccept,
    refetchApplications,
    ...overlays,
  }
}

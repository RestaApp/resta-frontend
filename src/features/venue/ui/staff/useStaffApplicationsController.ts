import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectStaffApplicationsOpen,
  setStaffApplicationsOpen,
} from '@/store/slices/navigationSlice'
import { selectUserData } from '@/store/slices/userSlice'
import { getUserPhotoUrl } from '@/shared/utils/userFieldNormalizers'
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
  const ownerPhotoUrl = getUserPhotoUrl(userData ?? {})
  const dispatch = useAppDispatch()
  const isApplicationsOpen = useAppSelector(selectStaffApplicationsOpen)
  const setIsApplicationsOpen = useCallback(
    (open: boolean) => {
      dispatch(setStaffApplicationsOpen(open))
    },
    [dispatch]
  )

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

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { setLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { getScreenForTab } from '@/shared/constants/navigation'
import { getPathForScreen } from '@/shared/constants/routePaths'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'

interface UseFeedDetailsControllerParams {
  selectedShiftId: number | null
  setSelectedShiftId: (value: number | null) => void
  closeApplicationSuccess: () => void
}

export const useFeedDetailsController = ({
  selectedShiftId,
  setSelectedShiftId,
  closeApplicationSuccess,
}: UseFeedDetailsControllerParams) => {
  const dispatch = useAppDispatch()
  const selectedRole = useAppSelector(selectSelectedRole)
  const { overlay, openShiftDetail, closeOverlay, replaceOverlayWithPath } = useDetailOverlay()

  // Sync: when overlay is cleared externally (back button), clear local selectedShiftId.
  const prevOverlayRef = useRef(overlay)
  useEffect(() => {
    if (prevOverlayRef.current && !overlay && selectedShiftId) {
      setSelectedShiftId(null)
    }
    prevOverlayRef.current = overlay
  }, [overlay, selectedShiftId, setSelectedShiftId])

  const openShiftDetails = useCallback(
    (id: number) => {
      setSelectedShiftId(id)
      openShiftDetail(id)
    },
    [openShiftDetail, setSelectedShiftId]
  )

  const closeShiftDetails = useCallback(() => {
    setSelectedShiftId(null)
    closeOverlay()
  }, [closeOverlay, setSelectedShiftId])

  const replaceDetailRouteWithActivity = useCallback(() => {
    if (!selectedRole) return
    const screen = getScreenForTab(selectedRole, 'activity')
    if (!screen) return
    replaceOverlayWithPath(getPathForScreen(selectedRole, screen))
  }, [replaceOverlayWithPath, selectedRole])

  const openApplicationsAfterApply = useCallback(() => {
    closeApplicationSuccess()
    replaceDetailRouteWithActivity()
    setSelectedShiftId(null)
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS, 'true')
    dispatch(navigateToTab('activity'))
  }, [closeApplicationSuccess, dispatch, replaceDetailRouteWithActivity, setSelectedShiftId])

  const searchMoreAfterApply = useCallback(() => {
    closeApplicationSuccess()
    setSelectedShiftId(null)
    closeOverlay()
  }, [closeApplicationSuccess, closeOverlay, setSelectedShiftId])

  const handleEditShift = useCallback(
    (id: number) => {
      setLocalStorageItem(STORAGE_KEYS.EDIT_SHIFT_ID, String(id))
      dispatch(navigateToTab('activity'))
    },
    [dispatch]
  )

  return {
    openShiftDetails,
    closeShiftDetails,
    openApplicationsAfterApply,
    searchMoreAfterApply,
    handleEditShift,
  }
}

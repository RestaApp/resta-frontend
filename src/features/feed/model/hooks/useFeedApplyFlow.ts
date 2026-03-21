import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import { STORAGE_KEYS } from '@/constants/storage'
import { setLocalStorageItem } from '@/utils/localStorage'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'
import type { AppDispatch } from '@/store'

export type ProfileAlertState = {
  open: boolean
  message: string
  missingFields: string[]
}

type UseFeedApplyFlowParams = {
  dispatch: AppDispatch
  t: TFunction
  handleApply: (shiftId: number, message?: string) => Promise<void>
}

export const useFeedApplyFlow = ({ dispatch, t, handleApply }: UseFeedApplyFlowParams) => {
  const [profileAlert, setProfileAlert] = useState<ProfileAlertState>({
    open: false,
    message: '',
    missingFields: [],
  })
  const [isApplyCoverModalOpen, setIsApplyCoverModalOpen] = useState(false)
  const [isApplyCoverModalSubmitting, setIsApplyCoverModalSubmitting] = useState(false)
  const [applyCoverTargetShiftId, setApplyCoverTargetShiftId] = useState<number | null>(null)

  const closeProfileAlert = useCallback(() => {
    setProfileAlert(prev => ({ ...prev, open: false }))
  }, [])

  const openProfileEdit = useCallback(() => {
    closeProfileAlert()
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
    dispatch(navigateToTab('profile'))
    window.dispatchEvent(new CustomEvent('openProfileEdit'))
  }, [closeProfileAlert, dispatch])

  const applyWithGuard = useCallback(
    async (shiftId: number, message?: string) => {
      try {
        await handleApply(shiftId, message)
        return true
      } catch (error: unknown) {
        const normalized = normalizeApiError(error, t('errors.applyError'), t)

        if (normalized.kind === 'profile_incomplete') {
          setProfileAlert({
            open: true,
            missingFields: normalized.missingFieldsLabels,
            message: normalized.message,
          })
          return false
        }

        setProfileAlert({
          open: true,
          missingFields: [],
          message: normalized.message,
        })
        return false
      }
    },
    [handleApply, t]
  )

  const closeApplyCoverModal = useCallback(() => {
    setIsApplyCoverModalOpen(false)
    setApplyCoverTargetShiftId(null)
  }, [])

  const handleApplyWithModal = useCallback(async (shiftId: number) => {
    setApplyCoverTargetShiftId(shiftId)
    setIsApplyCoverModalOpen(true)
  }, [])

  const submitApplyCoverModal = useCallback(
    async (message?: string) => {
      if (!applyCoverTargetShiftId || isApplyCoverModalSubmitting) return
      setIsApplyCoverModalSubmitting(true)
      try {
        const ok = await applyWithGuard(applyCoverTargetShiftId, message)
        if (ok) {
          closeApplyCoverModal()
        }
      } finally {
        setIsApplyCoverModalSubmitting(false)
      }
    },
    [applyCoverTargetShiftId, isApplyCoverModalSubmitting, applyWithGuard, closeApplyCoverModal]
  )

  return {
    profileAlert,
    closeProfileAlert,
    openProfileEdit,
    isApplyCoverModalOpen,
    isApplyCoverModalSubmitting,
    closeApplyCoverModal,
    handleApplyWithModal,
    submitApplyCoverModal,
  }
}

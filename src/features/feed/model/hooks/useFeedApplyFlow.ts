import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
import { openProfileEditFlow } from '@/shared/lib/openProfileEditFlow'
import type { AppDispatch } from '@/store'

export type ProfileAlertState = {
  open: boolean
  message: string
}

type ApplicationSuccessState = {
  open: boolean
  shiftId: number | null
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
  })
  const [isApplyCoverModalOpen, setIsApplyCoverModalOpen] = useState(false)
  const [isApplyCoverModalSubmitting, setIsApplyCoverModalSubmitting] = useState(false)
  const [applyCoverTargetShiftId, setApplyCoverTargetShiftId] = useState<number | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState<ApplicationSuccessState>({
    open: false,
    shiftId: null,
  })

  const closeProfileAlert = useCallback(() => {
    setProfileAlert(prev => ({ ...prev, open: false }))
  }, [])

  const openProfileEdit = useCallback(() => {
    closeProfileAlert()
    openProfileEditFlow(dispatch)
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
            message: normalized.message,
          })
          return false
        }

        setProfileAlert({
          open: true,
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

  const closeApplicationSuccess = useCallback(() => {
    setApplicationSuccess(prev => ({ ...prev, open: false }))
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
          setApplicationSuccess({
            open: true,
            shiftId: applyCoverTargetShiftId,
          })
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
    applyCoverTargetShiftId,
    applicationSuccess,
    closeApplyCoverModal,
    closeApplicationSuccess,
    handleApplyWithModal,
    submitApplyCoverModal,
  }
}

import { useCallback, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import {
  type VacancyApiItem,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
import { getTelegramWebApp } from '@/utils/telegram'
import type { ShiftStatus } from '@/components/ui/StatusPill'

interface UseShiftDetailsScreenControllerParams {
  shift: Shift | null
  vacancyData?: VacancyApiItem | null
  applicationId?: number | null
  onClose: () => void
  onApply: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  hourlyRate: string | null
  t: TFunction
}

const extractModerationMessage = (result: unknown): string | undefined => {
  const r = result as { message?: string; data?: { message?: string } } | null
  return r?.message ?? r?.data?.message
}

export const useShiftDetailsScreenController = ({
  shift,
  vacancyData,
  applicationId = null,
  onClose,
  onApply,
  onCancel,
  hourlyRate,
  t,
}: UseShiftDetailsScreenControllerParams) => {
  const currentUserId = useCurrentUserId()
  const { showToast } = useToast()
  const [acceptApplication] = useAcceptApplicationMutation()
  const [rejectApplication] = useRejectApplicationMutation()

  const [activeTab, setActiveTab] = useState<'applicants' | 'details'>('applicants')
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null)
  const [selectedApplicantApplicationId, setSelectedApplicantApplicationId] = useState<
    number | null
  >(null)
  const [moderating, setModerating] = useState<{ id: number; action: 'accept' | 'reject' } | null>(
    null
  )

  const isOwner = Boolean(
    shift?.isMine || (currentUserId && shift?.ownerId && shift.ownerId === currentUserId)
  )
  const description = vacancyData?.description?.trim() ?? ''
  const requirements = vacancyData?.requirements?.trim() ?? ''
  const location = shift?.location?.trim() ?? ''
  const hasDate = Boolean(shift?.date?.trim())
  const hasTime = Boolean(shift?.time?.trim())

  const applicants = vacancyData?.applications_preview ?? []
  const showTabs = isOwner && applicants.length > 0
  const applicationsCount = vacancyData?.applications_count

  const selectedApp = applicants.find(
    a => (a.shift_application_id ?? a.id) === selectedApplicantApplicationId
  )
  const selectedAppStatus =
    selectedApp?.shift_application_status ?? selectedApp?.status ?? 'pending'
  const canModerateSelected =
    isOwner &&
    typeof selectedApplicantApplicationId === 'number' &&
    (selectedAppStatus === 'pending' || selectedAppStatus === 'accepted')

  const appStatus: ShiftStatus =
    vacancyData?.my_application?.status ?? shift?.applicationStatus ?? null
  const isAccepted = appStatus === 'accepted'
  const isRejected = appStatus === 'rejected'

  const paySuffix = useMemo(() => {
    if (!shift) return t('common.payPerShift')
    const base = shift.payPeriod === 'month' ? t('common.payPerMonth') : t('common.payPerShift')
    if (!hourlyRate) return base
    return `${base} (${hourlyRate} ${shift.currency}/час)`
  }, [hourlyRate, shift, t])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleApply = useCallback(async () => {
    if (!shift) return
    try {
      await onApply(shift.id)
    } catch {
      // Ошибка уже обрабатывается выше по стеку.
    }
  }, [shift, onApply])

  const handleCancel = useCallback(async () => {
    if (!shift || isRejected) return
    const appId = applicationId ?? shift.applicationId ?? vacancyData?.my_application?.id ?? null
    try {
      await onCancel(appId, shift.id)
      handleClose()
    } catch {
      // Ошибка уже обрабатывается выше по стеку.
    }
  }, [shift, isRejected, applicationId, vacancyData, onCancel, handleClose])

  const handleOpenMap = useCallback(() => {
    if (!location) return

    const encodedLocation = encodeURIComponent(location)
    const yandexUrl = `https://yandex.ru/maps/?text=${encodedLocation}`
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`

    const openExternalMapLink = (url: string) => {
      const webApp = getTelegramWebApp()
      if (webApp?.openLink) {
        webApp.openLink(url)
        return
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const webApp = getTelegramWebApp()
    if (webApp?.showPopup) {
      webApp.showPopup(
        {
          title: t('shift.openMapTitle', 'Открыть на карте'),
          message: t('shift.openMapMessage', 'Выберите приложение карт'),
          buttons: [
            { id: 'yandex', type: 'default', text: t('shift.openInYandex', 'Яндекс Карты') },
            { id: 'google', type: 'default', text: t('shift.openInGoogle', 'Google Maps') },
            { type: 'cancel' },
          ],
        },
        buttonId => {
          if (buttonId === 'google') {
            openExternalMapLink(googleUrl)
            return
          }
          if (buttonId === 'yandex') {
            openExternalMapLink(yandexUrl)
          }
        }
      )
      return
    }

    openExternalMapLink(yandexUrl)
  }, [location, t])

  const handleAcceptApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'accept' })
        triggerHapticFeedback('light')
        const result = await acceptApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(extractModerationMessage(result) ?? t('shift.applicationAccepted'), 'success')
      } catch (e) {
        const err = normalizeApiError(e, t('shift.acceptApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [acceptApplication, shift?.id, showToast, t]
  )

  const handleRejectApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'reject' })
        triggerHapticFeedback('light')
        const result = await rejectApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(extractModerationMessage(result) ?? t('shift.applicationRejected'), 'success')
      } catch (e) {
        const err = normalizeApiError(e, t('shift.rejectApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [rejectApplication, shift?.id, showToast, t]
  )

  return {
    isOwner,
    description,
    requirements,
    location,
    hasDate,
    hasTime,
    applicants,
    showTabs,
    applicationsCount,
    selectedAppStatus,
    canModerateSelected,
    appStatus,
    isAccepted,
    isRejected,
    paySuffix,
    activeTab,
    setActiveTab,
    selectedApplicantId,
    setSelectedApplicantId,
    selectedApplicantApplicationId,
    setSelectedApplicantApplicationId,
    moderating,
    handleClose,
    handleApply,
    handleCancel,
    handleOpenMap,
    handleAcceptApplication,
    handleRejectApplication,
  }
}

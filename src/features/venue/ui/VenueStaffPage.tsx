import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetReceivedShiftApplicationsQuery,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ErrorState } from '@/components/ui/states'
import { useToast } from '@/shared/lib/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { VenueStaffList, type StaffItem } from './staff/VenueStaffList'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'

export function VenueStaffPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data, isLoading, isError, refetch } = useGetReceivedShiftApplicationsQuery()
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [selectedItem, setSelectedItem] = useState<StaffItem | null>(null)
  const [moderatingAction, setModeratingAction] = useState<'accept' | 'reject' | null>(null)
  const [acceptingApplicationId, setAcceptingApplicationId] = useState<number | null>(null)

  const applications = useMemo(
    () => (data?.data && Array.isArray(data.data) ? data.data : []),
    [data]
  )

  const staffItems: StaffItem[] = useMemo(() => {
    const list: StaffItem[] = []

    for (const application of applications) {
      const applicationId = application.shift_application_id ?? application.id
      if (!applicationId) continue

      list.push({
        shiftId: application.shift_id ?? 0,
        shiftTitle: application.shift_title ?? '',
        applicationId,
        applicationStatus: application.shift_application_status ?? application.status ?? 'pending',
        person: application,
      })
    }

    return list
  }, [applications])

  const handleAccept = async (applicationId: number, shiftId: number) => {
    try {
      setAcceptingApplicationId(applicationId)
      await acceptApplication({
        applicationId,
        shiftId: shiftId > 0 ? shiftId : undefined,
      }).unwrap()
      showToast(t('venueUi.staff.accepted', { defaultValue: 'Сотрудник принят' }), 'success')
      return true
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      const isShiftClosedError = errorMessage
        ?.toLowerCase()
        .includes('shift is not open for accepting applications')

      if (isShiftClosedError) {
        showToast(
          t('venueUi.staff.acceptClosedError', {
            defaultValue: 'Смена уже закрыта для принятия откликов',
          }),
          'warning'
        )
        return false
      }

      showToast(
        errorMessage ??
          t('venueUi.staff.acceptError', { defaultValue: 'Не удалось принять заявку' }),
        'error'
      )
      return false
    } finally {
      setAcceptingApplicationId(null)
    }
  }

  const handleReject = async (applicationId: number, shiftId: number) => {
    try {
      await rejectApplication({
        applicationId,
        shiftId: shiftId > 0 ? shiftId : undefined,
      }).unwrap()
      showToast(t('venueUi.staff.rejected', { defaultValue: 'Заявка отклонена' }), 'warning')
      return true
    } catch (error) {
      showToast(
        getErrorMessage(error) ??
          t('venueUi.staff.rejectError', { defaultValue: 'Не удалось отклонить заявку' }),
        'error'
      )
      return false
    }
  }

  const { openUserProfile, closeOverlay } = useDetailOverlay()

  const handleSelectApplicant = (
    userId: number,
    applicationId: number | null,
    shiftId: number
  ) => {
    const item =
      staffItems.find(
        candidate =>
          candidate.shiftId === shiftId &&
          (candidate.applicationId === applicationId ||
            candidate.person.shift_application_id === applicationId ||
            candidate.person.id === applicationId)
      ) ??
      staffItems.find(
        candidate =>
          candidate.shiftId === shiftId &&
          (candidate.person.user_id === userId || candidate.person.user?.id === userId)
      )

    if (!item) return
    setSelectedItem(item)
    openUserProfile(userId)
  }

  const handleCloseDetails = () => {
    setSelectedItem(null)
    setModeratingAction(null)
    closeOverlay()
  }

  const handleDrawerAccept = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('accept')
      const isSuccess = await handleAccept(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  const handleDrawerReject = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('reject')
      const isSuccess = await handleReject(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  if (isError) {
    return (
      <ErrorState
        title={t('feed.loadErrorShifts', { defaultValue: 'Ошибка загрузки' })}
        onRetry={() => void refetch()}
        retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
      />
    )
  }

  return (
    <>
      <PullToRefresh
        onRefresh={() => refetch()}
        disabled={isLoading || isAccepting || isRejecting || moderatingAction != null}
      >
        <VenueStaffList
          isLoading={isLoading}
          items={staffItems}
          isAccepting={isAccepting}
          acceptingApplicationId={acceptingApplicationId}
          onAccept={handleAccept}
          onSelectApplicant={handleSelectApplicant}
        />
      </PullToRefresh>

      <UserProfileDrawer
        userId={selectedItem?.person.user_id ?? selectedItem?.person.user?.id ?? null}
        open={selectedItem != null}
        onClose={handleCloseDetails}
        applicationId={selectedItem?.applicationId ?? null}
        applicationStatus={
          selectedItem?.applicationStatus === 'accepted'
            ? 'accepted'
            : selectedItem?.applicationStatus === 'rejected'
              ? 'rejected'
              : 'pending'
        }
        canModerate={selectedItem?.applicationStatus !== 'rejected'}
        moderatingAction={moderatingAction}
        onAccept={handleDrawerAccept}
        onReject={handleDrawerReject}
      />
    </>
  )
}

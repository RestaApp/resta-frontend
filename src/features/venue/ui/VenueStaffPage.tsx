import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetReceivedShiftApplicationsQuery,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useToast } from '@/hooks/useToast'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import { VenueStaffList, type StaffFilter, type StaffItem } from './staff/VenueStaffList'

const normalizeShiftStatus = (status?: string | null): string => {
  if (!status) return 'active'
  if (status === 'open') return 'active'
  return status
}

export function VenueStaffPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data, isLoading, isError, refetch } = useGetReceivedShiftApplicationsQuery()
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [activeFilter, setActiveFilter] = useState<StaffFilter>('all')
  const [selectedItem, setSelectedItem] = useState<StaffItem | null>(null)
  const [moderatingAction, setModeratingAction] = useState<'accept' | 'reject' | null>(null)

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
        shiftStatus: normalizeShiftStatus(application.shift_status),
        applicationId,
        applicationStatus:
          application.shift_application_status ?? application.status ?? 'pending',
        person: application,
      })
    }

    return list
  }, [applications])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return staffItems
    if (activeFilter === 'current') {
      return staffItems.filter(
        item => item.applicationStatus === 'accepted' && item.shiftStatus === 'active'
      )
    }

    return staffItems.filter(
      item =>
        item.applicationStatus === 'accepted' &&
        (item.shiftStatus === 'completed' || item.shiftStatus === 'cancelled')
    )
  }, [activeFilter, staffItems])

  const handleAccept = async (applicationId: number, shiftId: number) => {
    try {
      await acceptApplication({ applicationId, shiftId: shiftId > 0 ? shiftId : undefined }).unwrap()
      showToast(t('venueUi.staff.accepted', { defaultValue: 'Сотрудник принят' }), 'success')
      await refetch()
    } catch {
      showToast(
        t('venueUi.staff.acceptError', { defaultValue: 'Не удалось принять заявку' }),
        'error'
      )
    }
  }

  const handleReject = async (applicationId: number, shiftId: number) => {
    try {
      await rejectApplication({ applicationId, shiftId: shiftId > 0 ? shiftId : undefined }).unwrap()
      showToast(t('venueUi.staff.rejected', { defaultValue: 'Заявка отклонена' }), 'success')
      await refetch()
    } catch {
      showToast(
        t('venueUi.staff.rejectError', { defaultValue: 'Не удалось отклонить заявку' }),
        'error'
      )
    }
  }

  const handleOpenDetails = (item: StaffItem) => {
    const userId = item.person.user_id ?? item.person.user?.id ?? null
    if (!userId) return
    setSelectedItem(item)
  }

  const handleCloseDetails = () => {
    setSelectedItem(null)
    setModeratingAction(null)
  }

  const handleDrawerAccept = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('accept')
      await handleAccept(selectedItem.applicationId, selectedItem.shiftId)
      handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  const handleDrawerReject = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('reject')
      await handleReject(selectedItem.applicationId, selectedItem.shiftId)
      handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  if (isError) {
    return (
      <div className="ui-density-page ui-density-py text-center text-destructive">
        {t('feed.loadErrorShifts', { defaultValue: 'Ошибка загрузки' })}
      </div>
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
          activeFilter={activeFilter}
          onSetActiveFilter={setActiveFilter}
          items={filteredItems}
          isAccepting={isAccepting}
          isRejecting={isRejecting}
          onAccept={handleAccept}
          onReject={handleReject}
          onOpenDetails={handleOpenDetails}
        />
      </PullToRefresh>

      <UserProfileDrawer
        userId={selectedItem?.person.user_id ?? selectedItem?.person.user?.id ?? null}
        open={selectedItem != null}
        onClose={handleCloseDetails}
        applicationId={selectedItem?.applicationId ?? null}
        applicationStatus={selectedItem?.applicationStatus === 'accepted' ? 'accepted' : 'pending'}
        canModerate={selectedItem?.applicationStatus !== 'rejected'}
        moderatingAction={moderatingAction}
        onAccept={handleDrawerAccept}
        onReject={handleDrawerReject}
      />
    </>
  )
}

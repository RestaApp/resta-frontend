import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetMyShiftsQuery,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useToast } from '@/hooks/useToast'
import { VenueStaffList, type StaffFilter, type StaffItem } from './staff/VenueStaffList'

export function VenueStaffPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data, isLoading, isError, refetch } = useGetMyShiftsQuery()
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [activeFilter, setActiveFilter] = useState<StaffFilter>('all')

  const shifts: VacancyApiItem[] = useMemo(
    () => (data?.data && Array.isArray(data.data) ? normalizeVacanciesResponse(data) : []),
    [data]
  )

  const staffItems: StaffItem[] = useMemo(() => {
    const list: StaffItem[] = []

    for (const shift of shifts) {
      const previews = shift.applications_preview ?? []
      for (const person of previews) {
        const applicationId = person.shift_application_id ?? person.id
        if (!applicationId) continue

        list.push({
          shiftId: shift.id,
          shiftTitle: shift.title ?? '',
          shiftStatus: shift.status ?? 'active',
          applicationId,
          applicationStatus: person.shift_application_status ?? person.status ?? 'pending',
          person,
        })
      }
    }

    return list
  }, [shifts])

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
      await acceptApplication({ applicationId, shiftId }).unwrap()
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
      await rejectApplication({ applicationId, shiftId }).unwrap()
      showToast(t('venueUi.staff.rejected', { defaultValue: 'Заявка отклонена' }), 'success')
      await refetch()
    } catch {
      showToast(
        t('venueUi.staff.rejectError', { defaultValue: 'Не удалось отклонить заявку' }),
        'error'
      )
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
    <PullToRefresh onRefresh={() => refetch()} disabled={isLoading || isAccepting || isRejecting}>
      <VenueStaffList
        isLoading={isLoading}
        activeFilter={activeFilter}
        onSetActiveFilter={setActiveFilter}
        items={filteredItems}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </PullToRefresh>
  )
}

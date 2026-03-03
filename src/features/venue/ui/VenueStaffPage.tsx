import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetMyShiftsQuery,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import type { ApplicationPreviewApiItem, VacancyApiItem } from '@/services/api/shiftsApi'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { useToast } from '@/hooks/useToast'
import { getLogoByPosition } from '@/features/feed/model/utils/mapping'

type StaffFilter = 'all' | 'current' | 'former'

interface StaffItem {
  shiftId: number
  shiftTitle: string
  shiftStatus: string
  applicationId: number
  applicationStatus: string
  person: ApplicationPreviewApiItem
}

const FILTERS: StaffFilter[] = ['all', 'current', 'former']

const getFullName = (item: ApplicationPreviewApiItem, fallback: string) => {
  if (item.full_name) return item.full_name
  if (item.user?.full_name) return item.user.full_name
  const fromParts = [item.user?.name, item.user?.last_name].filter(Boolean).join(' ')
  return fromParts || fallback
}

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
      return staffItems.filter(item => item.applicationStatus === 'accepted' && item.shiftStatus === 'active')
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
      showToast(t('venueUi.staff.acceptError', { defaultValue: 'Не удалось принять заявку' }), 'error')
    }
  }

  const handleReject = async (applicationId: number, shiftId: number) => {
    try {
      await rejectApplication({ applicationId, shiftId }).unwrap()
      showToast(t('venueUi.staff.rejected', { defaultValue: 'Заявка отклонена' }), 'success')
      await refetch()
    } catch {
      showToast(t('venueUi.staff.rejectError', { defaultValue: 'Не удалось отклонить заявку' }), 'error')
    }
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-destructive">
        {t('feed.loadErrorShifts', { defaultValue: 'Ошибка загрузки' })}
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={() => refetch()} disabled={isLoading || isAccepting || isRejecting}>
      <div className="space-y-4 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(filter => (
            <Button
              key={filter}
              size="sm"
              variant={activeFilter === filter ? 'primary' : 'outline'}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'current'
                ? t('venueUi.staff.filters.current', { defaultValue: 'Текущие' })
                : filter === 'former'
                  ? t('venueUi.staff.filters.former', { defaultValue: 'Бывшие' })
                  : t('venueUi.staff.filters.all', { defaultValue: 'Все' })}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            message={t('venueUi.staff.emptyTitle', { defaultValue: 'Сотрудников пока нет' })}
            description={t('venueUi.staff.emptyDescription', {
              defaultValue: 'Принятые сотрудники появятся здесь после обработки заявок',
            })}
            illustration={<EmptyInboxIllustration className="h-24 w-24" />}
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const fullName = getFullName(item.person, t('common.user', { defaultValue: 'Сотрудник' }))
              const position =
                item.person.position ??
                item.person.user?.position ??
                t('venueUi.staff.noPosition', { defaultValue: 'Без позиции' })
              const isPending = item.applicationStatus === 'pending'

              return (
                <Card key={`${item.shiftId}-${item.applicationId}`} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback>
                        {getLogoByPosition(position, item.person.user_id ?? item.person.user?.id ?? 0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{position}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.shiftTitle}</p>
                    </div>

                    <Badge
                      variant={
                        item.applicationStatus === 'accepted'
                          ? 'primary'
                          : item.applicationStatus === 'rejected'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {item.applicationStatus === 'accepted'
                        ? t('venueUi.staff.status.accepted', { defaultValue: 'Принят' })
                        : item.applicationStatus === 'rejected'
                          ? t('venueUi.staff.status.rejected', { defaultValue: 'Отклонён' })
                          : t('venueUi.staff.status.pending', { defaultValue: 'На рассмотрении' })}
                    </Badge>
                  </div>

                  {isPending ? (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="primary"
                        disabled={isAccepting || isRejecting}
                        onClick={() => handleAccept(item.applicationId, item.shiftId)}
                      >
                        {t('venueUi.staff.actions.accept', { defaultValue: 'Принять' })}
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="outline"
                        disabled={isAccepting || isRejecting}
                        onClick={() => handleReject(item.applicationId, item.shiftId)}
                      >
                        {t('venueUi.staff.actions.reject', { defaultValue: 'Отклонить' })}
                      </Button>
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}

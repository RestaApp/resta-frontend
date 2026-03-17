import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { getLogoByPosition } from '@/features/feed/model/utils/mapping'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, type TabOption } from '@/components/ui/tabs'

export type StaffFilter = 'all' | 'current' | 'former'

export interface StaffItem {
  shiftId: number
  shiftTitle: string
  shiftStatus: string
  applicationId: number
  applicationStatus: string
  person: ApplicationPreviewApiItem
}

const getFullName = (item: ApplicationPreviewApiItem, fallback: string) => {
  if (item.full_name) return item.full_name
  if (item.user?.full_name) return item.user.full_name
  const fromParts = [item.user?.name, item.user?.last_name].filter(Boolean).join(' ')
  return fromParts || fallback
}

interface VenueStaffListProps {
  isLoading: boolean
  activeFilter: StaffFilter
  onSetActiveFilter: (value: StaffFilter) => void
  items: StaffItem[]
  isAccepting: boolean
  isRejecting: boolean
  onAccept: (applicationId: number, shiftId: number) => void
  onReject: (applicationId: number, shiftId: number) => void
  onOpenDetails: (item: StaffItem) => void
}

export const VenueStaffList = ({
  isLoading,
  activeFilter,
  onSetActiveFilter,
  items,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
  onOpenDetails,
}: VenueStaffListProps) => {
  const { t } = useTranslation()
  const filterOptions: TabOption<StaffFilter>[] = [
    { id: 'all', label: t('venueUi.staff.filters.all', { defaultValue: 'Все' }) },
    { id: 'current', label: t('venueUi.staff.filters.current', { defaultValue: 'Текущие' }) },
    { id: 'former', label: t('venueUi.staff.filters.former', { defaultValue: 'Бывшие' }) },
  ]

  return (
    <div>
      <div className="ui-density-page ui-density-py-sm">
        <Tabs
          options={filterOptions}
          activeId={activeFilter}
          onChange={onSetActiveFilter}
          ariaLabel={t('venueUi.staff.filtersAria', { defaultValue: 'Фильтры сотрудников' })}
        />
      </div>

      <div className="ui-density-page ui-density-py">
        {isLoading ? (
          <div className="ui-density-stack-sm">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message={t('venueUi.staff.emptyTitle', { defaultValue: 'Сотрудников пока нет' })}
            description={t('venueUi.staff.emptyDescription', {
              defaultValue: 'Принятые сотрудники появятся здесь после обработки заявок',
            })}
            illustration={<EmptyInboxIllustration className="h-24 w-24" />}
          />
        ) : (
          <div className="ui-density-stack-sm">
            {items.map(item => {
              const fullName = getFullName(
                item.person,
                t('common.user', { defaultValue: 'Сотрудник' })
              )
              const position =
                item.person.position ??
                item.person.user?.position ??
                item.person.user?.employee_profile?.position ??
                t('venueUi.staff.noPosition', { defaultValue: 'Без позиции' })
              const isPending = item.applicationStatus === 'pending'
              const photoUrl =
                item.person.user?.photo_url ?? item.person.user?.profile_photo_url ?? null

              return (
                <Card
                  key={`${item.shiftId}-${item.applicationId}`}
                  className="ui-density-stack-sm p-4"
                >
                  <div
                    className="flex items-start gap-3 cursor-pointer rounded-lg transition-colors hover:bg-muted/30"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenDetails(item)}
                    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      onOpenDetails(item)
                    }}
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={photoUrl} alt={fullName} />
                      <AvatarFallback>
                        {getLogoByPosition(
                          position,
                          item.person.user_id ?? item.person.user?.id ?? 0
                        )}
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
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        size="md"
                        variant="outline"
                        disabled={isAccepting || isRejecting}
                        onClick={event => {
                          event.stopPropagation()
                          onReject(item.applicationId, item.shiftId)
                        }}
                      >
                        {t('venueUi.staff.actions.reject', { defaultValue: 'Отклонить' })}
                      </Button>
                      <Button
                        className="flex-1"
                        size="md"
                        variant="gradient"
                        disabled={isAccepting || isRejecting}
                        onClick={event => {
                          event.stopPropagation()
                          onAccept(item.applicationId, item.shiftId)
                        }}
                      >
                        {t('venueUi.staff.actions.accept', { defaultValue: 'Принять' })}
                      </Button>
                    </div>
                  ) : null}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

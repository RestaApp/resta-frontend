import { useMemo, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import { getLogoByPosition } from '@/features/feed/model/utils/mapping'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { useLabels } from '@/shared/i18n/hooks'

export interface StaffItem {
  shiftId: number
  shiftTitle: string
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
  items: StaffItem[]
  isAccepting: boolean
  isRejecting: boolean
  onAccept: (applicationId: number, shiftId: number) => void
  onReject: (applicationId: number, shiftId: number) => void
  onOpenDetails: (item: StaffItem) => void
}

export const VenueStaffList = ({
  isLoading,
  items,
  isAccepting,
  isRejecting,
  onAccept,
  onReject,
  onOpenDetails,
}: VenueStaffListProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()
  const groupedItems = useMemo(() => {
    const groups: Record<'pending' | 'accepted' | 'rejected', StaffItem[]> = {
      pending: [],
      accepted: [],
      rejected: [],
    }

    for (const item of items) {
      if (item.applicationStatus === 'accepted') {
        groups.accepted.push(item)
        continue
      }
      if (item.applicationStatus === 'rejected') {
        groups.rejected.push(item)
        continue
      }
      groups.pending.push(item)
    }

    return [
      {
        id: 'pending' as const,
        label: t('venueUi.staff.status.pending', { defaultValue: 'На рассмотрении' }),
        items: groups.pending,
      },
      {
        id: 'accepted' as const,
        label: t('venueUi.staff.status.accepted', { defaultValue: 'Принят' }),
        items: groups.accepted,
      },
      {
        id: 'rejected' as const,
        label: t('venueUi.staff.status.rejected', { defaultValue: 'Отклонён' }),
        items: groups.rejected,
      },
    ]
  }, [items, t])

  return (
    <div className="ui-density-page ui-density-py">
      {isLoading ? (
        <FeedCardSkeletonList variant="staff" className="ui-density-stack-sm" />
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
          {groupedItems
            .filter(group => group.items.length > 0)
            .map(group => (
              <div key={group.id} className="ui-density-stack-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label} ({group.items.length})
                </div>
                {group.items.map(item => {
                  const fullName = getFullName(
                    item.person,
                    t('common.user', { defaultValue: 'Сотрудник' })
                  )
                  const rawPosition =
                    item.person.position ??
                    item.person.user?.position ??
                    item.person.user?.employee_profile?.position ??
                    null
                  const positionLabel = rawPosition
                    ? getEmployeePositionLabel(rawPosition)
                    : t('venueUi.staff.noPosition', { defaultValue: 'Без позиции' })
                  const isPending = item.applicationStatus === 'pending'
                  const photoUrl =
                    item.person.user?.photo_url ?? item.person.user?.profile_photo_url ?? null

                  return (
                    <div
                      key={`${item.shiftId}-${item.applicationId}`}
                      className="shift-compact-card ui-density-stack-sm"
                    >
                      <div
                        className="flex cursor-pointer items-start gap-[10px] rounded-lg transition-colors"
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenDetails(item)}
                        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return
                          event.preventDefault()
                          onOpenDetails(item)
                        }}
                      >
                        <Avatar className="shift-compact-logo h-9 w-9 shrink-0 self-start p-0">
                          <AvatarImage src={photoUrl} alt={fullName} />
                          <AvatarFallback>
                            {getLogoByPosition(
                              rawPosition,
                              item.person.user_id ?? item.person.user?.id ?? 0
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="shift-compact-title truncate">{fullName}</p>
                          <p className="shift-compact-sub truncate">{positionLabel}</p>
                          <p className="mt-1 truncate text-meta text-muted-foreground">
                            {item.shiftTitle}
                          </p>
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
                              : t('venueUi.staff.status.pending', {
                                  defaultValue: 'На рассмотрении',
                                })}
                        </Badge>
                      </div>

                      {isPending ? (
                        <div className="flex gap-3 border-t border-border/40 pt-3">
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
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { ErrorState } from '@/components/ui/states'
import { FeedCard } from '@/components/ui/shift-card/ShiftCard'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { mapVacancyToCardShift } from '@/shared/shifts/mapping'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'

interface VenueListingsDrawerProps {
  /** ID заведения, чьи вакансии показываем. */
  userId: number
  /** Название заведения для заголовка. */
  venueName?: string
  open: boolean
  onClose: () => void
}

/**
 * Открытые вакансии заведения (#12). Forward-compatible: запрос идёт с `user_id`,
 * но текущий бэкенд этот фильтр игнорирует — поэтому дофильтровываем по `ownerId`
 * на клиенте (см. HANDOFF). Когда бэк добавит фильтр, клиентская фильтрация станет no-op.
 */
export const VenueListingsDrawer = memo(function VenueListingsDrawer({
  userId,
  venueName,
  open,
  onClose,
}: VenueListingsDrawerProps) {
  const { t } = useTranslation()
  const { openVacancyDetail } = useDetailOverlay()

  const { data, isLoading, isError } = useGetVacanciesQuery(
    { shift_type: 'vacancy', user_id: userId, per_page: 100 },
    { skip: !open }
  )

  const cards = useMemo(() => {
    return normalizeVacanciesResponse(data)
      .filter(item => item.user?.id === userId)
      .map(mapVacancyToCardShift)
  }, [data, userId])

  return (
    <Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DrawerFrame className="flex-1">
        <DrawerTitleBar title={venueName || t('profile.venueListings.title')} onClose={onClose} />

        <DrawerBody className="ui-density-stack">
          {isLoading ? (
            <FeedCardSkeletonList />
          ) : isError ? (
            <ErrorState title={t('errors.loadError')} className="min-h-0 py-10" />
          ) : cards.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('profile.venueListings.empty')}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {cards.map(shift => (
                <FeedCard key={shift.id} shift={shift} onOpenDetails={openVacancyDetail} />
              ))}
            </div>
          )}
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
})

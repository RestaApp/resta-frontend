import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { ShiftCard } from '@/components/ui/shift-card/ShiftCard'
import { DetailsScreenFrame } from '@/components/ui/shift-details-screen/DetailsScreenFrame'
import { useLazyGetVacanciesQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import { useGetUserQuery } from '@/services/api/usersApi'
import { vacancyToShift } from '@/features/feed/model/utils/mapping'
import type { ShiftStatus } from '@/components/ui/StatusPill'

const PAGE_SIZE = 20

interface RestaurantVacanciesDrawerProps {
  restaurantId: number | null
  open: boolean
  onClose: () => void
  onOpenVacancy: (vacancyId: number) => void
  getApplicationId: (id: number) => number | undefined
  getApplicationStatus: (id: number) => ShiftStatus
  isApplied: (id: number) => boolean
  onApply: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isShiftLoading: (id: number) => boolean
}

export const RestaurantVacanciesDrawer = ({
  restaurantId,
  open,
  onClose,
  onOpenVacancy,
  getApplicationId,
  getApplicationStatus,
  isApplied,
  onApply,
  onCancel,
  isShiftLoading,
}: RestaurantVacanciesDrawerProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isVacanciesError, setIsVacanciesError] = useState(false)
  const [items, setItems] = useState<VacancyApiItem[]>([])
  const [loadVacancies, { isFetching: isVacanciesFetching }] = useLazyGetVacanciesQuery()

  const shouldSkip = !open || restaurantId === null

  const { data: userResponse, isLoading: isUserLoading } = useGetUserQuery(restaurantId ?? 0, {
    skip: shouldSkip,
  })

  const resetListState = useCallback(() => {
    setPage(0)
    setItems([])
    setHasMore(false)
    setIsVacanciesError(false)
  }, [])

  const loadPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      if (restaurantId === null) return

      if (replace) {
        setIsInitialLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setIsVacanciesError(false)

      try {
        const response = await loadVacancies(
          {
            shift_type: 'vacancy',
            user_id: restaurantId,
            page: nextPage,
            per_page: PAGE_SIZE,
          },
          true
        ).unwrap()

        const nextItems = (response.data ?? []).filter(item => item.user?.id === restaurantId)
        setItems(prev => {
          const map = new Map<number, VacancyApiItem>()
          if (!replace) {
            for (const item of prev) map.set(item.id, item)
          }
          for (const item of nextItems) map.set(item.id, item)
          return Array.from(map.values())
        })
        setPage(nextPage)

        const pagination = response.pagination ?? response.meta
        const nextHasMore =
          pagination?.next_page !== undefined && pagination?.next_page !== null
            ? true
            : Boolean(
                pagination?.current_page &&
                  pagination?.total_pages &&
                  pagination.current_page < pagination.total_pages
              )
        setHasMore(nextHasMore)
      } catch {
        setIsVacanciesError(true)
      } finally {
        setIsInitialLoading(false)
        setIsLoadingMore(false)
      }
    },
    [loadVacancies, restaurantId]
  )

  useEffect(() => {
    if (!open || restaurantId === null) return
    resetListState()
    void loadPage(1, true)
  }, [open, restaurantId, resetListState, loadPage])

  const restaurantName = useMemo(() => {
    const user = userResponse?.data
    if (!user) return t('roles.venueInfoTitle')
    const named = user.restaurant_profile?.name?.trim()
    if (named) return named
    return user.full_name?.trim() || user.name?.trim() || t('roles.venueInfoTitle')
  }, [userResponse?.data, t])

  const shifts = useMemo(() => items.map(vacancyToShift), [items])

  const handleOpenVacancy = useCallback(
    (vacancyId: number) => {
      onOpenVacancy(vacancyId)
      onClose()
    },
    [onClose, onOpenVacancy]
  )

  return (
    <DetailsScreenFrame
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onClose()
      }}
      onClose={onClose}
      closeAriaLabel={t('common.close')}
      title={restaurantName}
      headerMeta={
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" aria-hidden />
          {t('tabs.feed.jobs')}
        </span>
      }
    >
      {isVacanciesError ? (
        <EmptyState
          message={t('errors.loadError')}
          description={t('feed.tryAgainLater', { defaultValue: 'Попробуйте позже' })}
        />
      ) : null}

      {!isVacanciesError && isInitialLoading && items.length === 0 ? (
        <div className="space-y-3">
          <ShiftSkeleton />
          <ShiftSkeleton />
          <ShiftSkeleton />
        </div>
      ) : null}

      {!isVacanciesError && !isInitialLoading && shifts.length === 0 ? (
        <EmptyState
          message={t('feed.noVacancies')}
          description={t('feed.noVacanciesDescription')}
        />
      ) : null}

      {shifts.length > 0 ? (
        <div className="space-y-3">
          {shifts.map(shift => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              applicationId={getApplicationId(shift.id) ?? null}
              applicationStatus={getApplicationStatus(shift.id) ?? null}
              isApplied={isApplied(shift.id)}
              onOpenDetails={handleOpenVacancy}
              onApply={onApply}
              onCancel={onCancel}
              isLoading={isShiftLoading(shift.id)}
            />
          ))}

          {hasMore ? (
            <Button
              variant="outline"
              onClick={() => void loadPage(page + 1, false)}
              loading={isVacanciesFetching || isLoadingMore}
              disabled={isVacanciesFetching || isLoadingMore}
              className="w-full"
            >
              {t('common.loadMore', { defaultValue: 'Показать ещё' })}
            </Button>
          ) : null}
        </div>
      ) : null}

      {isUserLoading && !isInitialLoading && shifts.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
      ) : null}
    </DetailsScreenFrame>
  )
}

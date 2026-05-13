import { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '@/features/feed/model/utils/formatting'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { toLocalISODateKey } from '@/utils/datetime'

export interface HotOffer {
  id: number
  emoji: string
  photoUrl?: string | null
  payment: number
  currency?: string
  rating?: number
  /** В сменах — дата; в вакансиях не используется в карточке */
  time: string
  /** Дата смены (для replacement) */
  date?: string
  dateKey?: string | null
  /** Период оплаты для подписи "за смену" / "за месяц" */
  payPeriod?: 'shift' | 'month'
  restaurant: string
  title?: string | null
  position: string
  specialization?: string | null
  city?: string | null
  location?: string | null
  distanceKm?: number | null
  applicationsCount?: number | null
  shiftType?: 'vacancy' | 'replacement'
}

interface HotOffersProps {
  items: HotOffer[]
  onItemClick?: (item: HotOffer) => void
  totalCount?: number
  onShowAll?: () => void
  isVacancy?: boolean
}

interface HotOfferCardProps {
  item: HotOffer
  onClick: (item: HotOffer) => void
}

const stripHotTitlePrefix = (title: string): string => {
  return title.replace(/^(?:\s|🔥)+/u, '').trim()
}

const formatHotDistanceKm = (distanceKm?: number | null): string | null => {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm <= 0) return null
  const rounded = distanceKm < 10 ? Math.round(distanceKm * 10) / 10 : Math.round(distanceKm)
  return `${rounded} км`
}

const isTodayDateKey = (dateKey?: string | null): boolean => {
  return Boolean(dateKey) && dateKey === toLocalISODateKey(new Date())
}

const HotOfferCard = memo(({ item, onClick }: HotOfferCardProps) => {
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const handleClick = useCallback(() => onClick(item), [item, onClick])

  const positionText = useMemo(() => {
    const position = getEmployeePositionLabel(item.position)
    const specialization = item.specialization
      ? ` • ${getSpecializationLabel(item.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [item.position, item.specialization, getEmployeePositionLabel, getSpecializationLabel])

  const paymentText = useMemo(() => {
    if (!Number.isFinite(item.payment) || item.payment <= 0) return null
    return formatMoney(item.payment)
  }, [item.payment])

  const title = stripHotTitlePrefix(item.title?.trim() || positionText)
  const subtitle =
    item.shiftType === 'replacement' && positionText
      ? `${item.restaurant} · ${positionText}`
      : item.restaurant
  const distanceText = formatHotDistanceKm(item.distanceKm)
  const locationText = distanceText ?? item.location ?? item.city ?? null
  const metaTime = [item.date, item.time && item.time !== item.date ? item.time : '']
    .filter(Boolean)
    .join(' ')
  const isToday = isTodayDateKey(item.dateKey)

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'shift-compact-card shift-compact-card-sos snap-center w-[220px] shrink-0 text-left outline-none transition-all duration-150 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className="shift-compact-row">
        <div className="min-w-0 flex-1">
          <div className="shift-compact-badge-row">
            <span className="shift-compact-badge">🔥 SOS{isToday ? ' · СЕГОДНЯ' : ''}</span>
          </div>
          <h3 className="shift-compact-title line-clamp-2">{title}</h3>
          <p className="shift-compact-sub truncate">{subtitle}</p>
        </div>

        <div className="shrink-0 text-right leading-none tabular-nums text-foreground">
          {paymentText ? (
            <>
              <span className="shift-compact-price font-display">{paymentText}</span>
              <span className="shift-compact-currency">{item.currency ?? 'BYN'}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="shift-compact-meta min-w-0">
        {metaTime ? <span className="shrink-0">⏱ {metaTime}</span> : null}
        {locationText ? (
          <span className="min-w-[4rem] flex-1 truncate">📍 {locationText}</span>
        ) : null}
        {item.rating && item.rating > 0 ? (
          <span className="shrink-0 text-success">★ {item.rating.toFixed(1)}</span>
        ) : null}
        {item.applicationsCount ? (
          <span className="shrink-0 text-muted-foreground">👤 {item.applicationsCount}</span>
        ) : null}
      </div>
    </button>
  )
})
HotOfferCard.displayName = 'HotOfferCard'

export const HotOffers = memo(
  ({ items, onItemClick, totalCount, onShowAll, isVacancy }: HotOffersProps) => {
    const { t } = useTranslation()
    const handleItemClick = useCallback((item: HotOffer) => onItemClick?.(item), [onItemClick])

    const title = useMemo(() => {
      if (isVacancy === true) return t('feed.hotVacancies') || t('feed.hotOffers')
      if (isVacancy === false) return t('feed.hotShifts') || t('feed.hotOffers')
      return t('feed.hotOffers')
    }, [isVacancy, t])

    const showAllLabel = useMemo(() => t('feed.showAllHotOffers') || t('common.all'), [t])

    return (
      <div
        className={cn(
          'mx-4 py-3 pl-4 pr-1 rounded-xl',
          'bg-card border border-primary/20 border-l-[3px] border-l-primary'
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-micro font-bold leading-none tracking-widest uppercase bg-primary text-white">
              SOS
            </span>
            <h3 className="font-display text-xl tracking-tight flex items-center gap-2">
              {title}
              {totalCount !== undefined ? (
                <span className="font-mono-resta text-sm font-normal text-muted-foreground">
                  · {totalCount}
                </span>
              ) : null}
            </h3>
          </div>
          {onShowAll ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowAll}
              className="text-xs text-primary hover:underline shrink-0"
            >
              {showAllLabel}
            </Button>
          ) : null}
        </div>

        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x -mx-1 px-1">
          {items.map(item => (
            <HotOfferCard key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </div>
      </div>
    )
  }
)
HotOffers.displayName = 'HotOffers'

import { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '../../model/utils/formatting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface HotOffer {
  id: number
  emoji: string
  payment: number
  currency?: string
  time: string
  restaurant: string
  position: string
  specialization?: string | null
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
    return `${formatMoney(item.payment)} ${item.currency ?? 'BYN'}`
  }, [item.payment, item.currency])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'snap-center flex-shrink-0 w-[110px] h-[135px] relative overflow-hidden rounded-xl bg-card border border-border p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer group active:scale-[0.99] transition-all duration-150 text-left motion-reduce:!transition-none motion-reduce:active:scale-100',
        'dark:border-[rgba(255,255,255,0.06)] dark:hover:border-[rgba(255,255,255,0.10)] dark:active:border-[rgba(255,255,255,0.10)] dark:shadow-none',
        'dark:border-primary/20 dark:hover:border-primary/30 dark:shadow-[0_0_0_1px_rgba(147,51,234,0.08)] dark:hover:shadow-[0_0_0_1px_rgba(147,51,234,0.14)]'
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/5 group-hover:from-primary/8 group-hover:to-primary/8 transition-colors pointer-events-none" />

      {paymentText ? (
        <Badge
          variant="primary"
          className="absolute top-0 right-0 rounded-bl-lg text-[10px] px-1.5 py-0.5 dark:font-semibold dark:text-[11px]"
        >
          {paymentText}
        </Badge>
      ) : null}

      <span className="mt-2 text-3xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 z-10">
        {item.emoji}
      </span>

      <span className="text-center w-full z-10">
        <span className="block text-[10px] text-muted-foreground truncate w-full mb-0.5">
          {item.restaurant}
        </span>
        <span className="block text-[9px] text-primary font-medium mb-0.5 truncate">
          {positionText}
        </span>
        <span className="block text-xs font-bold text-foreground leading-tight">{item.time}</span>
      </span>
    </button>
  )
})
HotOfferCard.displayName = 'HotOfferCard'

export const HotOffers = memo(({ items, onItemClick, totalCount, onShowAll, isVacancy }: HotOffersProps) => {
  const { t } = useTranslation()
  const handleItemClick = useCallback((item: HotOffer) => onItemClick?.(item), [onItemClick])

  const title = useMemo(() => {
    if (isVacancy === true) return t('feed.hotVacancies') || t('feed.hotOffers')
    if (isVacancy === false) return t('feed.hotShifts') || t('feed.hotOffers')
    return t('feed.hotOffers')
  }, [isVacancy, t])

  const showAllLabel = useMemo(() => {
    return t('feed.showAllHotOffers') || t('common.all')
  }, [t])

  return (
    <div
      className={cn(
        'py-3 px-4 rounded-xl',
        'bg-card/50 dark:bg-[#161A22] dark:border dark:border-primary/15 dark:border-l-2 dark:border-l-primary/40'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="text-lg" aria-hidden>🔥</span>
            {title}
            {totalCount !== undefined ? (
              <span className="text-sm font-normal text-muted-foreground">({totalCount})</span>
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

      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x -mx-1 px-1">
        {items.map(item => (
          <HotOfferCard key={item.id} item={item} onClick={handleItemClick} />
        ))}
      </div>
    </div>
  )
})
HotOffers.displayName = 'HotOffers'

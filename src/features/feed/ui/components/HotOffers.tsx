import { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '../../model/utils/formatting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
      className="snap-center flex-shrink-0 w-[110px] h-[135px] relative overflow-hidden rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer group active:scale-95 !transition-transform !duration-150 text-left motion-reduce:!transition-none motion-reduce:active:scale-100"
    >
      <span className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-colors" />

      {paymentText ? (
        <Badge
          variant="primary"
          className="absolute top-0 right-0 rounded-bl-lg text-[10px] px-1.5 py-0.5"
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
    // Приоритет — раздельные ключи; fallback на старый
    if (isVacancy === true) return t('feed.hotVacancies') || t('feed.hotOffers')
    if (isVacancy === false) return t('feed.hotShifts') || t('feed.hotOffers')
    return t('feed.hotOffers')
  }, [isVacancy, t])

  const showAllLabel = useMemo(() => {
    return t('feed.showAllHotOffers') || t('common.all')
  }, [t])

  return (
    <div className="py-2">
      <div className="px-4 mb-3 flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🔥</span> {title}
          {totalCount !== undefined ? (
            <span className="text-sm font-normal text-muted-foreground">({totalCount})</span>
          ) : null}
        </h3>

        {onShowAll ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowAll}
            className="text-xs text-primary hover:underline"
          >
            {showAllLabel}
          </Button>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide snap-x">
        {items.map(item => (
          <HotOfferCard key={item.id} item={item} onClick={handleItemClick} />
        ))}
      </div>
    </div>
  )
})
HotOffers.displayName = 'HotOffers'

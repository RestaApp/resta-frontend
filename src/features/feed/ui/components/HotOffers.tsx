import { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '../../model/utils/formatting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'

export interface HotOffer {
  id: number
  emoji: string
  photoUrl?: string | null
  payment: number
  currency?: string
  /** В сменах — дата; в вакансиях не используется в карточке */
  time: string
  /** Дата смены (для replacement) */
  date?: string
  /** Период оплаты для подписи "за смену" / "за месяц" */
  payPeriod?: 'shift' | 'month'
  restaurant: string
  position: string
  specialization?: string | null
  city?: string | null
  shiftType?: 'vacancy' | 'replacement'
}

interface HotOffersProps {
  items: HotOffer[]
  onItemClick?: (item: HotOffer) => void
  totalCount?: number
  onShowAll?: () => void
  isVacancy?: boolean
  /** Фильтр «срочные» активен — показываем «Убрать фильтр» */
  isUrgentFilterActive?: boolean
}

interface HotOfferCardProps {
  item: HotOffer
  onClick: (item: HotOffer) => void
}

const HotOfferCard = memo(({ item, onClick }: HotOfferCardProps) => {
  const { t } = useTranslation()
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

  const placeLine = useMemo(() => {
    const parts = [item.restaurant]
    if (item.city?.trim()) parts.push(item.city.trim())
    return parts.join(', ')
  }, [item.restaurant, item.city])

  const vacancyBottomLine = useMemo(() => {
    if (item.shiftType === 'replacement') return null
    if (!paymentText) return null
    const suffix =
      item.payPeriod === 'month'
        ? t('common.payPerMonthShort')
        : t('common.payPerShiftShort')
    return `${paymentText}${suffix}`
  }, [paymentText, item.shiftType, item.date, item.payPeriod, t])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'snap-center flex-shrink-0 w-[105px] min-h-[108px] relative overflow-hidden rounded-xl bg-card border border-border p-2 flex flex-col items-start text-left shadow-sm cursor-pointer group active:scale-[0.99] transition-all duration-150 motion-reduce:!transition-none motion-reduce:active:scale-100',
        'dark:border-[rgba(255,255,255,0.06)] dark:hover:border-[rgba(255,255,255,0.10)] dark:active:border-[rgba(255,255,255,0.10)] dark:shadow-none',
        'dark:border-primary/20 dark:hover:border-primary/30 dark:shadow-[0_0_0_1px_rgba(147,51,234,0.08)] dark:hover:shadow-[0_0_0_1px_rgba(147,51,234,0.14)]'
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/5 group-hover:from-primary/8 group-hover:to-primary/8 transition-colors pointer-events-none" />

      {paymentText && item.shiftType !== 'replacement' ? (
        <Badge
          variant="primary"
          className="absolute top-0 right-0 rounded-bl-lg text-[10px] px-1.5 py-0.5 dark:font-semibold dark:text-[11px] z-10"
        >
          {paymentText}
        </Badge>
      ) : null}

      <Avatar className="w-8 h-8 z-10 border border-border/50 bg-primary/10">
        <AvatarImage src={item.photoUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-primary/10 text-base">
          <span
            className="drop-shadow-sm transform group-hover:scale-105 transition-transform duration-200"
            aria-hidden
          >
            {item.emoji}
          </span>
        </AvatarFallback>
      </Avatar>

      <div className="mt-1 w-full flex flex-col min-w-0 z-10 gap-1 flex-1">
        <span className="block text-[14px] leading-4 font-semibold text-foreground overflow-hidden line-clamp-2">
          {positionText}
        </span>
        <span className="block text-[11px] text-muted-foreground leading-tight break-words line-clamp-2 overflow-hidden">
          {placeLine}
        </span>
        {item.shiftType === 'replacement' ? (
          item.date ? (
            <span className="mt-auto block text-[12px] text-primary font-semibold truncate pt-0.5">
              {item.date}
            </span>
          ) : null
        ) : vacancyBottomLine ? (
          <span className="mt-auto block text-[12px] text-primary font-semibold truncate">
            {vacancyBottomLine}
          </span>
        ) : null}
      </div>
    </button>
  )
})
HotOfferCard.displayName = 'HotOfferCard'

export const HotOffers = memo(({ items, onItemClick, totalCount, onShowAll, isVacancy, isUrgentFilterActive }: HotOffersProps) => {
  const { t } = useTranslation()
  const handleItemClick = useCallback((item: HotOffer) => onItemClick?.(item), [onItemClick])

  const title = useMemo(() => {
    if (isVacancy === true) return t('feed.hotVacancies') || t('feed.hotOffers')
    if (isVacancy === false) return t('feed.hotShifts') || t('feed.hotOffers')
    return t('feed.hotOffers')
  }, [isVacancy, t])

  const showAllLabel = useMemo(() => {
    if (isUrgentFilterActive) return t('feed.clearHotFilter')
    return t('feed.showAllHotOffers') || t('common.all')
  }, [t, isUrgentFilterActive])

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

      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x -mx-1 px-1">
        {items.map(item => (
          <HotOfferCard key={item.id} item={item} onClick={handleItemClick} />
        ))}
      </div>
    </div>
  )
})
HotOffers.displayName = 'HotOffers'

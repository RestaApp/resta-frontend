import { memo, useMemo, useCallback } from 'react'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'
import { formatMoney } from '../utils/formatting'

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
}

interface HotOfferCardProps {
    item: HotOffer
    onClick: (item: HotOffer) => void
}

const HotOfferCard = memo(({ item, onClick }: HotOfferCardProps) => {
    const handleClick = useCallback(() => onClick(item), [item, onClick])

    const positionText = useMemo(() => {
        const position = getEmployeePositionLabel(item.position)
        const specialization = item.specialization ? ` • ${getSpecializationLabel(item.specialization)}` : ''
        return `${position}${specialization}`
    }, [item.position, item.specialization])

    const paymentText = useMemo(() => {
        if (!Number.isFinite(item.payment) || item.payment <= 0) return null
        return `${formatMoney(item.payment)} ${item.currency ?? 'BYN'}`
    }, [item.payment, item.currency])

    return (
        <button
            type="button"
            onClick={handleClick}
            className="snap-center flex-shrink-0 w-[110px] h-[135px] relative overflow-hidden rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer group active:scale-95 transition-transform text-left"
        >
            <span className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-colors" />

            {paymentText ? (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    {paymentText}
                </span>
            ) : null}

            <span className="mt-2 text-3xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300 z-10">
                {item.emoji}
            </span>

            <span className="text-center w-full z-10">
                <span className="block text-[10px] text-muted-foreground truncate w-full mb-0.5">
                    {item.restaurant}
                </span>
                <span className="block text-[9px] text-primary font-medium mb-0.5 truncate">{positionText}</span>
                <span className="block text-xs font-bold text-foreground leading-tight">{item.time}</span>
            </span>
        </button>
    )
})
HotOfferCard.displayName = 'HotOfferCard'

export const HotOffers = memo(({ items, onItemClick, totalCount, onShowAll }: HotOffersProps) => {
    const handleItemClick = useCallback((item: HotOffer) => onItemClick?.(item), [onItemClick])

    const hasMore = useMemo(
        () => totalCount !== undefined && items.length < totalCount,
        [totalCount, items.length]
    )

    return (
        <div className="py-2">
            <div className="px-4 mb-3 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">🔥</span> Горящие смены
                    {totalCount !== undefined ? (
                        <span className="text-sm font-normal text-muted-foreground">({totalCount})</span>
                    ) : null}
                </h3>

                {hasMore && onShowAll ? (
                    <button
                        type="button"
                        onClick={onShowAll}
                        className="text-xs text-primary font-medium hover:underline"
                    >
                        Все
                    </button>
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

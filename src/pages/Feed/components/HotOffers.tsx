import { memo, useMemo, useCallback } from 'react'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'

export interface HotOffer {
    id: number
    emoji: string
    payment: number
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

/**
 * Компонент карточки горящей смены
 */
const HotOfferCard = memo(({ item, onClick }: HotOfferCardProps) => {
    const handleClick = useCallback(() => {
        onClick(item)
    }, [item, onClick])

    const positionText = useMemo(() => {
        const position = getEmployeePositionLabel(item.position)
        const specialization = item.specialization
            ? ` • ${getSpecializationLabel(item.specialization)}`
            : ''
        return `${position}${specialization}`
    }, [item.position, item.specialization])

    const paymentText = useMemo(() => {
        if (item.payment > 0 && !isNaN(item.payment)) {
            return `${Math.round(item.payment)} BYN`
        }
        return null
    }, [item.payment])

    return (
        <div
            onClick={handleClick}
            className="snap-center flex-shrink-0 w-[100px] h-[130px] relative overflow-hidden rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-between shadow-sm cursor-pointer group active:scale-95 transition-transform"
        >
            {/* Градиентный фон */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-colors" />

            {/* Бейдж оплаты */}
            {paymentText && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    {paymentText}
                </div>
            )}

            <div className="mt-2 text-3xl drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                {item.emoji}
            </div>

            <div className="text-center w-full z-10">
                <p className="text-[10px] text-muted-foreground truncate w-full mb-0.5">
                    {item.restaurant}
                </p>
                <p className="text-[9px] text-primary font-medium mb-0.5">{positionText}</p>
                <p className="text-xs font-bold text-foreground leading-tight">{item.time}</p>
            </div>
        </div>
    )
})

HotOfferCard.displayName = 'HotOfferCard'

export const HotOffers = memo(({ items, onItemClick, totalCount, onShowAll }: HotOffersProps) => {
    const handleItemClick = useCallback(
        (item: HotOffer) => {
            onItemClick?.(item)
        },
        [onItemClick]
    )

    // Проверяем, есть ли еще горящие смены для показа
    const hasMore = useMemo(
        () => totalCount !== undefined && items.length < totalCount,
        [totalCount, items.length]
    )

    return (
        <div className="py-2">
            <div className="px-4 mb-3 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">🔥</span> Горящие смены
                    {totalCount !== undefined && (
                        <span className="text-sm font-normal text-muted-foreground">
                            ({totalCount})
                        </span>
                    )}
                </h3>
                {hasMore && onShowAll && (
                    <span
                        onClick={onShowAll}
                        className="text-xs text-primary font-medium cursor-pointer hover:underline"
                    >
                        Все
                    </span>
                )}
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
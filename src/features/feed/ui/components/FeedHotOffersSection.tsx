import { memo } from 'react'
import { HotOffers, type HotOffer } from './HotOffers'

type Props = {
    hotOffers: HotOffer[]
    totalCount?: number
    onShowAll: () => void
    onItemClick: (item: HotOffer) => void
}

export const FeedHotOffersSection = memo((props: Props) => {
    const { hotOffers, totalCount, onShowAll, onItemClick } = props

    if (hotOffers.length === 0) return null

    const hasMore = Boolean(totalCount && hotOffers.length < totalCount)

    return (
        <HotOffers
            items={hotOffers}
            totalCount={totalCount}
            onShowAll={hasMore ? onShowAll : undefined}
            onItemClick={onItemClick}
        />
    )
})
FeedHotOffersSection.displayName = 'FeedHotOffersSection'
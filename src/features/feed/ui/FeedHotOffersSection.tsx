import { memo } from 'react'
import { HotOffers, type HotOffer } from './components/HotOffers'
import type { FeedType } from '../model/types'

type Props = {
    feedType: FeedType
    hotOffers: HotOffer[]
    totalCount?: number
    onShowAll: () => void
    onItemClick: (item: HotOffer) => void
}

export const FeedHotOffersSection = memo((props: Props) => {
    const { feedType, hotOffers, totalCount, onShowAll, onItemClick } = props

    if (feedType !== 'shifts' || hotOffers.length === 0) return null

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
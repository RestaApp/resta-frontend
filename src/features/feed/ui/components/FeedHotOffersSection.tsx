import { memo } from 'react'
import { HotOffers, type HotOffer } from './HotOffers'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  hotOffers: HotOffer[]
  totalCount?: number
  onShowAll: () => void
  onItemClick: (item: HotOffer) => void
  isLoading: boolean
}

export const FeedHotOffersSection = memo((props: Props) => {
  const { hotOffers, totalCount, onShowAll, onItemClick, isLoading } = props

  if (isLoading && hotOffers.length === 0) {
    return (
      <div className="py-2">
        <div className="px-4 mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide snap-x">
          <Skeleton className="w-[110px] h-[135px] rounded-2xl" />
          <Skeleton className="w-[110px] h-[135px] rounded-2xl" />
          <Skeleton className="w-[110px] h-[135px] rounded-2xl" />
          <Skeleton className="w-[110px] h-[135px] rounded-2xl" />
        </div>
      </div>
    )
  }

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

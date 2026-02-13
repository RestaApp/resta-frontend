import { FeedHeader } from './components/FeedHeader'
import { FeedHotOffersSection } from './components/FeedHotOffersSection'
import { FeedBody } from './components/FeedBody'
import { useFeedPageModel } from '../model/hooks/useFeedPageModel'
import type { FeedBodyVm } from '../model/FeedBodyVm.types'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'

export const FeedPage = () => {
  const m = useFeedPageModel()
  const vm: FeedBodyVm = m

  return (
    <PullToRefresh onRefresh={m.refreshFeed} isRefreshing={m.isRefreshing || m.isHotOffersFetching}>
      <div className=" bg-background">
        <FeedHeader
          options={m.feedTypeOptions}
          feedType={m.feedType}
          onChangeFeedType={m.setFeedType}
          onOpenFilters={m.openFilters}
          isLoading={m.isRefreshing}
          hasActiveAdvancedFilters={m.hasActiveAdvancedFilters}
          activeFiltersList={m.activeFiltersList}
        />

        <FeedHotOffersSection
          hotOffers={m.hotOffers}
          totalCount={m.hotOffersTotalCount}
          isLoading={m.isHotOffersFetching}
          onShowAll={m.showAllHotShifts}
          onItemClick={m.onHotOfferClick}
        />

        <FeedBody vm={vm} />
      </div>
    </PullToRefresh>
  )
}

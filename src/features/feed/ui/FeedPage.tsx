import { FeedHeader } from './components/FeedHeader'
import { FeedHotOffersSection } from './components/FeedHotOffersSection'
import { FeedBody } from './components/FeedBody'
import { useFeedPageModel } from '../model/hooks/useFeedPageModel'
import type { FeedBodyVm } from '../model/FeedBodyVm.types'

export const FeedPage = () => {
  const m = useFeedPageModel()
  const vm: FeedBodyVm = m

  return (
    <div className=" bg-background">
      <FeedHeader
        options={m.feedTypeOptions}
        feedType={m.feedType}
        onChangeFeedType={m.setFeedType}
        activeFiltersList={m.activeFiltersList}
      />

      <FeedHotOffersSection
        isLoading={m.isRefreshing}
        hotOffers={m.hotOffers}
        totalCount={m.hotOffersTotalCount}
        onShowAll={m.showAllHotShifts}
        onItemClick={m.onHotOfferClick}
        isVacancy={m.isVacancy}
      />

      <FeedBody vm={vm} />
    </div>
  )
}

import { FeedHeader } from './components/FeedHeader'
import { FeedBody } from './components/FeedBody'
import { useFeedPageModel } from '../model/hooks/useFeedPageModel'
import type { FeedBodyVm } from '../model/FeedBodyVm.types'

export const FeedPage = () => {
  const m = useFeedPageModel()
  const vm: FeedBodyVm = m

  return (
    <div className="bg-background ui-density-stack-sm">
      <FeedHeader
        options={m.feedTypeOptions}
        feedType={m.feedType}
        onChangeFeedType={m.setFeedType}
        activeFilters={m.activeFilters}
        onResetFilters={m.resetFilters}
        onRemoveFilter={m.removeFilter}
      />

      <FeedBody vm={vm} />
    </div>
  )
}

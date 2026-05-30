import { memo } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { SearchFilters } from '@/shared/ui/SearchFilters'
import type { FeedType } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'
import { TAB_ACTIVE_INDICATOR_CLASS, TAB_ACTIVE_TRIGGER_CLASS } from '@/components/ui/ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'

type Props = {
  options: TabOption<FeedType>[]
  feedType: FeedType
  onChangeFeedType: (t: FeedType) => void
  activeFiltersList: string[]
  onResetFilters: () => void
}

export const FeedHeader = memo((props: Props) => {
  const { options, feedType, onChangeFeedType, activeFiltersList, onResetFilters } = props

  return (
    <div
      className="top-0 border-border/50 bg-background/92 backdrop-blur-sm transition-all"
      style={{ zIndex: Z_INDEX.stickyHeader }}
    >
      <div className="ui-density-page ui-density-py-sm">
        <Tabs
          options={options}
          activeId={feedType}
          onChange={onChangeFeedType}
          activeIndicatorClassName={TAB_ACTIVE_INDICATOR_CLASS}
          activeTriggerClassName={TAB_ACTIVE_TRIGGER_CLASS}
        />
      </div>

      <SearchFilters activeFiltersList={activeFiltersList} onResetFilters={onResetFilters} />
    </div>
  )
})
FeedHeader.displayName = 'FeedHeader'

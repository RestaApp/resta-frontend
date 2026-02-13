import { memo } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { SearchFilters } from './SearchFilters'
import type { FeedType } from '../../model/types'
import type { TabOption } from '@/components/ui/tabs'

type Props = {
  options: TabOption<FeedType>[]
  feedType: FeedType
  onChangeFeedType: (t: FeedType) => void

  activeFiltersList: string[]
}

export const FeedHeader = memo((props: Props) => {
  const { options, feedType, onChangeFeedType, activeFiltersList } = props

  return (
    <div className="sticky top-0 z-20 border-border/50 bg-background/95 backdrop-blur-sm transition-all">
      <div className="px-4 py-2">
        <Tabs options={options} activeId={feedType} onChange={onChangeFeedType} />
      </div>

      <SearchFilters activeFiltersList={activeFiltersList} />
    </div>
  )
})
FeedHeader.displayName = 'FeedHeader'

import { memo } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { SearchFilters } from './SearchFilters'
import type { FeedType } from '../../model/types'
import type { TabOption } from '@/components/ui/tabs'

type Props = {
    options: TabOption<FeedType>[]
    feedType: FeedType
    onChangeFeedType: (t: FeedType) => void

    onOpenFilters: () => void
    isLoading: boolean
    hasActiveAdvancedFilters: boolean
    activeFiltersList: string[]
}

export const FeedHeader = memo((props: Props) => {
    const {
        options,
        feedType,
        onChangeFeedType,
        onOpenFilters,
        isLoading,
        hasActiveAdvancedFilters,
        activeFiltersList,
    } = props

    return (
        <div className="sticky top-0 z-10 border-border/50 bg-background/95 pt-2 backdrop-blur-sm transition-all">
            <div className="px-4 pb-2">
                <Tabs options={options} activeId={feedType} onChange={onChangeFeedType} />
            </div>

            <SearchFilters
                onOpenFilters={onOpenFilters}
                isLoading={isLoading}
                hasActiveAdvancedFilters={hasActiveAdvancedFilters}
                activeFiltersList={activeFiltersList}
            />
        </div>
    )
})
FeedHeader.displayName = 'FeedHeader'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchFilters } from '@/shared/ui/SearchFilters'
import type { FeedType } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { ScreenTabsHeader } from '@/components/ui/screen-tabs-header'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { SlidersHorizontal } from 'lucide-react'

type Props = {
  options: TabOption<FeedType>[]
  feedType: FeedType
  onChangeFeedType: (t: FeedType) => void
  activeFilters: ActiveFilterItem[]
  onResetFilters: () => void
  onRemoveFilter: (id: string) => void
}

export const FeedHeader = memo((props: Props) => {
  const { options, feedType, onChangeFeedType, activeFilters, onResetFilters, onRemoveFilter } =
    props
  const { t } = useTranslation()

  return (
    <ScreenTabsHeader
      title={t('feed.headerTitle', { defaultValue: 'Лента' })}
      tabOptions={options}
      activeTabId={feedType}
      onTabChange={onChangeFeedType}
      action={{
        ariaLabel: t('feed.openFilters', { defaultValue: 'Фильтры' }),
        Icon: SlidersHorizontal,
        onClick: () => emitAppEvent(APP_EVENTS.OPEN_FEED_FILTERS),
      }}
      footer={
        <SearchFilters
          activeFilters={activeFilters}
          onResetFilters={onResetFilters}
          onRemoveFilter={onRemoveFilter}
        />
      }
    />
  )
})
FeedHeader.displayName = 'FeedHeader'

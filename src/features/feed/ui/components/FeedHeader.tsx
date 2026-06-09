import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { SearchFilters } from '@/shared/ui/SearchFilters'
import type { FeedType } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'
import {
  APP_HEADER_ACTION_BUTTON_CLASS,
  APP_HEADER_ACTION_ICON_CLASS,
  SCREEN_TITLE_CLASS,
  TAB_ACTIVE_INDICATOR_CLASS,
  TAB_ACTIVE_TRIGGER_CLASS,
} from '@/components/ui/ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { SlidersHorizontal } from 'lucide-react'

type Props = {
  options: TabOption<FeedType>[]
  feedType: FeedType
  onChangeFeedType: (t: FeedType) => void
  activeFiltersList: string[]
  onResetFilters: () => void
}

export const FeedHeader = memo((props: Props) => {
  const { options, feedType, onChangeFeedType, activeFiltersList, onResetFilters } = props
  const { t } = useTranslation()
  const hasActiveFilters = activeFiltersList.length > 0

  return (
    <div
      className="top-0 border-border/50 bg-background/92 backdrop-blur-sm transition-all"
      style={{ zIndex: Z_INDEX.stickyHeader }}
    >
      <div
        className={cn(
          'flex min-h-16 items-center gap-3 ui-density-page ui-density-py-sm',
          hasActiveFilters ? null : 'border-b border-border'
        )}
      >
        <h1 className={cn(SCREEN_TITLE_CLASS, 'shrink-0')}>
          {t('feed.headerTitle', { defaultValue: 'Лента' })}
        </h1>

        <Tabs
          options={options}
          activeId={feedType}
          onChange={onChangeFeedType}
          className="min-w-0 flex-1"
          activeIndicatorClassName={TAB_ACTIVE_INDICATOR_CLASS}
          activeTriggerClassName={TAB_ACTIVE_TRIGGER_CLASS}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => emitAppEvent(APP_EVENTS.OPEN_FEED_FILTERS)}
          aria-label={t('feed.openFilters', { defaultValue: 'Фильтры' })}
          className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
        >
          <SlidersHorizontal className={APP_HEADER_ACTION_ICON_CLASS} />
        </Button>
      </div>

      <SearchFilters activeFiltersList={activeFiltersList} onResetFilters={onResetFilters} />
    </div>
  )
})
FeedHeader.displayName = 'FeedHeader'

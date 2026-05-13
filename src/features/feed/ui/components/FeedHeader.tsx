import { memo } from 'react'
import { Tabs } from '@/components/ui/tabs'
import { SearchFilters } from './SearchFilters'
import type { FeedType } from '../../model/types'
import type { TabOption } from '@/components/ui/tabs'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'

type Props = {
  options: TabOption<FeedType>[]
  feedType: FeedType
  onChangeFeedType: (t: FeedType) => void
  activeFiltersList: string[]
  onResetFilters: () => void
}

export const FeedHeader = memo((props: Props) => {
  const { options, feedType, onChangeFeedType, activeFiltersList, onResetFilters } = props

  const selectedRole = useAppSelector(selectSelectedRole)
  const roleTheme = getRoleTheme(selectedRole ?? 'employee')

  return (
    <div className="top-0 z-20 border-border/50 bg-background/95 backdrop-blur-sm transition-all">
      <div className="ui-density-page ui-density-py-sm">
        <Tabs
          options={options}
          activeId={feedType}
          onChange={onChangeFeedType}
          activeIndicatorClassName={cn('shadow-sm', roleTheme.classes.bg)}
          activeTriggerClassName={roleTheme.classes.textOn}
        />
      </div>

      <SearchFilters activeFiltersList={activeFiltersList} onResetFilters={onResetFilters} />
    </div>
  )
})
FeedHeader.displayName = 'FeedHeader'

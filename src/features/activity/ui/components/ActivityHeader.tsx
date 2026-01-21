import { memo, useMemo } from 'react'
import { CalendarDays, List } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import type { ActivityTab } from '../../model/hooks/useActivityPageModel'

type Props = {
  activeTab: ActivityTab
  onChange: (t: ActivityTab) => void
}

export const ActivityHeader = memo(({ activeTab, onChange }: Props) => {
  const tabOptions = useMemo<TabOption<ActivityTab>[]>(
    () => [
      { id: 'list', label: 'Список', icon: List },
      { id: 'calendar', label: 'Календарь', icon: CalendarDays },
    ],
    []
  )

  return (
    <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
      <div className="px-4 pb-2">
        <Tabs options={tabOptions} activeId={activeTab} onChange={onChange} />
      </div>
    </div>
  )
})
ActivityHeader.displayName = 'ActivityHeader'

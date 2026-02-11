import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, List } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import type { ActivityTab } from '../../model/hooks/useActivityPageModel'

type Props = {
  activeTab: ActivityTab
  onChange: (tab: ActivityTab) => void
}

export const ActivityHeader = memo(({ activeTab, onChange }: Props) => {
  const { t } = useTranslation()
  const tabOptions = useMemo<TabOption<ActivityTab>[]>(
    () => [
      { id: 'list', label: t('tabs.activity.list'), icon: List },
      { id: 'calendar', label: t('tabs.activity.calendar'), icon: CalendarDays },
    ],
    [t]
  )

  return (
    <div className="top-0 z-10 bg-background/95 backdrop-blur-sm transition-all border-border/50">
      <div className="px-4">
        <Tabs options={tabOptions} activeId={activeTab} onChange={onChange} />
      </div>
    </div>
  )
})
ActivityHeader.displayName = 'ActivityHeader'

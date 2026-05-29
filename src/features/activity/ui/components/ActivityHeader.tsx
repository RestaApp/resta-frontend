import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Briefcase, Send } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import type { ActivityTab } from '../../model/hooks/useActivityPageModel'
import { TAB_ACTIVE_INDICATOR_CLASS, TAB_ACTIVE_TRIGGER_CLASS } from '@/components/ui/ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'

type Props = {
  activeTab: ActivityTab
  onChange: (tab: ActivityTab) => void
}

export const ActivityHeader = memo(({ activeTab, onChange }: Props) => {
  const { t } = useTranslation()
  const tabOptions = useMemo<TabOption<ActivityTab>[]>(
    () => [
      { id: 'applications', label: t('tabs.activity.applications'), icon: Send },
      { id: 'shifts', label: t('tabs.activity.shifts'), icon: Briefcase },
    ],
    [t]
  )

  return (
    <div
      className="top-0 bg-background/92 backdrop-blur-sm transition-all border-border/50"
      style={{ zIndex: Z_INDEX.stickyHeader }}
    >
      <div className="ui-density-page ui-density-py-sm">
        <Tabs
          options={tabOptions}
          activeId={activeTab}
          onChange={onChange}
          activeIndicatorClassName={TAB_ACTIVE_INDICATOR_CLASS}
          activeTriggerClassName={TAB_ACTIVE_TRIGGER_CLASS}
        />
      </div>
    </div>
  )
})
ActivityHeader.displayName = 'ActivityHeader'

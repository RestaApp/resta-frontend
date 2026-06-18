import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScreenTabsHeader } from '@/components/ui/screen-tabs-header'
import { NotificationsBell } from '@/features/notifications/ui/NotificationsBell'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import {
  getHeaderAction,
  getHeaderTitle,
  resolveIsEmployeeFlow,
} from '@/components/appHeaderConfig'

interface AppHeaderProps {
  onAddShift?: () => void
  activeTab?: Tab
  role?: UiRole
}

export const AppHeader = ({ onAddShift, activeTab, role }: AppHeaderProps) => {
  const { t } = useTranslation()
  const isEmployeeFlow = resolveIsEmployeeFlow(role)

  const title = useMemo(() => getHeaderTitle(activeTab, t, role), [activeTab, role, t])
  const action = useMemo(
    () =>
      getHeaderAction({
        activeTab,
        t,
        onAddShift,
        role,
        isEmployeeFlow,
      }),
    [activeTab, isEmployeeFlow, onAddShift, role, t]
  )

  return (
    <ScreenTabsHeader title={title} action={action} leadingActionsSlot={<NotificationsBell />} />
  )
}

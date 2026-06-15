import { memo } from 'react'
import { Tabs, type TabOption } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  APP_HEADER_ACTION_BUTTON_CLASS,
  APP_HEADER_ACTION_ICON_CLASS,
  SCREEN_HEADER_ROW_CLASS,
  SCREEN_HEADER_SHELL_CLASS,
  SCREEN_HEADER_TABS_CLASS,
  SCREEN_TITLE_CLASS,
  TAB_ACTIVE_INDICATOR_CLASS,
  TAB_ACTIVE_TRIGGER_CLASS,
} from '@/components/ui/ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'
import type { HeaderAction } from '@/components/appHeaderConfig'

type ScreenTabsHeaderProps<T extends string> = {
  title: string
  tabOptions?: TabOption<T>[]
  activeTabId?: T
  onTabChange?: (id: T) => void
  action?: HeaderAction | null
  actionsSlot?: React.ReactNode
  actionButtonRef?: React.RefObject<HTMLButtonElement | null>
  footer?: React.ReactNode
}

const ScreenTabsHeaderInner = <T extends string>({
  title,
  tabOptions,
  activeTabId,
  onTabChange,
  action,
  actionsSlot,
  actionButtonRef,
  footer,
}: ScreenTabsHeaderProps<T>) => {
  const hasTabs = tabOptions != null && activeTabId != null && onTabChange != null

  return (
    <header className={cn(SCREEN_HEADER_SHELL_CLASS)} style={{ zIndex: Z_INDEX.stickyHeader }}>
      <div className={cn(SCREEN_HEADER_ROW_CLASS, 'border-b border-border')}>
        <h1 className={cn(SCREEN_TITLE_CLASS, 'shrink-0')}>{title}</h1>

        {hasTabs ? (
          <Tabs
            options={tabOptions}
            activeId={activeTabId}
            onChange={onTabChange}
            className={SCREEN_HEADER_TABS_CLASS}
            activeIndicatorClassName={TAB_ACTIVE_INDICATOR_CLASS}
            activeTriggerClassName={TAB_ACTIVE_TRIGGER_CLASS}
          />
        ) : (
          <div className={SCREEN_HEADER_TABS_CLASS} aria-hidden="true" />
        )}

        {actionsSlot ? (
          actionsSlot
        ) : action ? (
          <Button
            ref={actionButtonRef}
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
          >
            <action.Icon className={APP_HEADER_ACTION_ICON_CLASS} />
          </Button>
        ) : null}
      </div>

      {footer}
    </header>
  )
}

export const ScreenTabsHeader = memo(ScreenTabsHeaderInner) as typeof ScreenTabsHeaderInner

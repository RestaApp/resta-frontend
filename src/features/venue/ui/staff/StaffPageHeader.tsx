import { Inbox, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ScreenTabsHeader } from '@/components/ui/screen-tabs-header'
import { NotificationsBell } from '@/features/notifications/ui/NotificationsBell'
import {
  APP_HEADER_ACTION_BUTTON_CLASS,
  APP_HEADER_ACTION_ICON_CLASS,
} from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'

interface StaffPageHeaderProps {
  pendingApplicationsCount: number
  onOpenFilters: () => void
  onOpenApplications: () => void
}

export const StaffPageHeader = ({
  pendingApplicationsCount,
  onOpenFilters,
  onOpenApplications,
}: StaffPageHeaderProps) => {
  const { t } = useTranslation()

  const applicationsAriaLabel =
    pendingApplicationsCount > 0
      ? t('venueUi.staff.applications.openAriaWithCount', {
          count: pendingApplicationsCount,
          defaultValue: 'Отклики, {{count}} новых',
        })
      : t('venueUi.staff.applications.openAria', { defaultValue: 'Отклики' })

  return (
    <ScreenTabsHeader
      title={t('tabs.venue.staff', { defaultValue: 'Персонал' })}
      leadingActionsSlot={<NotificationsBell />}
      actionsSlot={
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenFilters}
            aria-label={t('venueUi.staff.catalog.filters.openAria', {
              defaultValue: 'Фильтры сотрудников',
            })}
            className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
          >
            <SlidersHorizontal className={APP_HEADER_ACTION_ICON_CLASS} />
          </Button>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenApplications}
              aria-label={applicationsAriaLabel}
              className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
            >
              <Inbox className={APP_HEADER_ACTION_ICON_CLASS} />
            </Button>
            {pendingApplicationsCount > 0 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold leading-none text-primary-foreground"
              >
                {pendingApplicationsCount > 99 ? '99+' : pendingApplicationsCount}
              </span>
            ) : null}
          </div>
        </div>
      }
    />
  )
}

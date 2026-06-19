import { memo, useCallback, useEffect, useState, createElement } from 'react'
import { useTranslation } from 'react-i18next'
import { BellOff, CheckCheck } from 'lucide-react'
import { InlineAction } from '@/components/ui/inline-action'
import { Drawer, DrawerBody, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { InlineAlert } from '@/components/ui/inline-alert'
import { Loader } from '@/components/ui/loader'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import { cn } from '@/shared/utils/cn'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type NotificationItem,
} from '@/services/api/notificationsApi'
import { formatRelativeTime, getNotificationIcon } from '../lib/notificationMeta'

const NotificationRow = memo(function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationItem
  onRead: (id: number) => void
}) {
  const isUnread = notification.status === 'unread'
  const Icon = getNotificationIcon(notification.notification_type)

  return (
    <button
      type="button"
      onClick={() => isUnread && onRead(notification.id)}
      data-haptic="light"
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors',
        isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'bg-card/40 hover:bg-secondary/60'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isUnread ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
        )}
      >
        {createElement(Icon, { className: ICON_MD_CLASS, 'aria-hidden': true })}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {notification.title}
          </span>
          {isUnread ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          ) : null}
        </div>
        {notification.message ? (
          <p className="line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">
            {notification.message}
          </p>
        ) : null}
        <span className="mt-0.5 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>
    </button>
  )
})

/**
 * Инбокс уведомлений: глобальный drawer, открывается по app-event
 * `OPEN_NOTIFICATIONS`. Список грузится только когда открыт.
 */
export const NotificationsDrawer = memo(function NotificationsDrawer() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => onAppEvent(APP_EVENTS.OPEN_NOTIFICATIONS, () => setOpen(true)), [])

  const { data, isLoading, isError } = useGetNotificationsQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation()

  const items = data?.data ?? []
  const hasUnread = items.some(item => item.status === 'unread')

  const handleRead = useCallback((id: number) => void markRead(id), [markRead])
  const handleMarkAll = useCallback(() => void markAllRead(), [markAllRead])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerFrame className="flex-1">
        <DrawerTitleBar
          title={t('notifications.title')}
          onClose={() => setOpen(false)}
          actions={
            hasUnread ? (
              <InlineAction icon={CheckCheck} onClick={handleMarkAll} disabled={isMarkingAll}>
                {t('notifications.markAllRead')}
              </InlineAction>
            ) : null
          }
        />

        <DrawerBody className="flex flex-col gap-2 pb-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : isError ? (
            <InlineAlert message={t('notifications.loadError')} className="my-4" />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{t('notifications.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('notifications.emptyDescription')}</p>
            </div>
          ) : (
            items.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))
          )}
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
})

import { memo, useCallback, useEffect, useState, createElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, BellOff, CheckCheck } from 'lucide-react'
import { InlineAction } from '@/components/ui/inline-action'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerBody, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { InlineAlert } from '@/components/ui/inline-alert'
import { Loader } from '@/components/ui/loader'
import { ICON_MD_CLASS, ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { cn } from '@/shared/utils/cn'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import {
  useArchiveNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type NotificationItem,
} from '@/services/api/notificationsApi'
import { formatRelativeTime, getNotificationIcon } from '../lib/notificationMeta'

const NotificationRow = memo(function NotificationRow({
  notification,
  onSelect,
  onArchive,
}: {
  notification: NotificationItem
  onSelect: (notification: NotificationItem) => void
  onArchive: (id: number) => void
}) {
  const { t } = useTranslation()
  const isUnread = notification.status === 'unread'
  const Icon = getNotificationIcon(notification.notification_type)

  return (
    <div
      className={cn(
        'flex items-stretch gap-1 rounded-lg border border-border/50 transition-colors',
        isUnread ? 'bg-primary/5' : 'bg-card/40'
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(notification)}
        data-haptic="light"
        className={cn(
          'flex min-w-0 flex-1 items-start gap-3 rounded-l-lg p-3 text-left transition-colors',
          isUnread ? 'hover:bg-primary/10' : 'hover:bg-secondary/60'
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

      <button
        type="button"
        onClick={() => onArchive(notification.id)}
        data-haptic="light"
        aria-label={t('notifications.archive')}
        title={t('notifications.archive')}
        className="flex w-10 shrink-0 items-center justify-center rounded-r-lg text-muted-foreground/60 transition-colors hover:bg-secondary/60 hover:text-foreground"
      >
        {createElement(Archive, { className: ICON_SM_CLASS, 'aria-hidden': true })}
      </button>
    </div>
  )
})

/**
 * Инбокс уведомлений: глобальный drawer, открывается по app-event
 * `OPEN_NOTIFICATIONS`. Список грузится только когда открыт.
 */
export const NotificationsDrawer = memo(function NotificationsDrawer() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { openShiftDetail } = useDetailOverlay()

  // При каждом открытии начинаем с первой страницы (кэш накапливается в merge).
  useEffect(
    () =>
      onAppEvent(APP_EVENTS.OPEN_NOTIFICATIONS, () => {
        setPage(1)
        setOpen(true)
      }),
    []
  )

  const { data, isLoading, isFetching, isError } = useGetNotificationsQuery(
    { page },
    {
      skip: !open,
      refetchOnMountOrArgChange: true,
    }
  )
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation()
  const [archive] = useArchiveNotificationMutation()

  const items = data?.data ?? []
  const hasUnread = items.some(item => item.status === 'unread')
  const hasNextPage = Boolean(data?.pagination?.next_page)

  // Тап: помечаем прочитанным и, если уведомление о смене, открываем её детальный оверлей.
  const handleSelect = useCallback(
    (notification: NotificationItem) => {
      if (notification.status === 'unread') void markRead(notification.id)
      if (
        notification.notifiable_type === 'Shift' &&
        typeof notification.notifiable_id === 'number'
      ) {
        setOpen(false)
        openShiftDetail(notification.notifiable_id)
      }
    },
    [markRead, openShiftDetail]
  )
  const handleArchive = useCallback((id: number) => void archive(id), [archive])
  const handleMarkAll = useCallback(() => void markAllRead(), [markAllRead])
  const handleLoadMore = useCallback(() => setPage(prev => prev + 1), [])

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
              <BellOff className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{t('notifications.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('notifications.emptyDescription')}</p>
            </div>
          ) : (
            <>
              {items.map(notification => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onSelect={handleSelect}
                  onArchive={handleArchive}
                />
              ))}
              {hasNextPage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 w-full"
                  loading={isFetching}
                  disabled={isFetching}
                  onClick={handleLoadMore}
                >
                  {t('notifications.loadMore')}
                </Button>
              ) : null}
            </>
          )}
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
})

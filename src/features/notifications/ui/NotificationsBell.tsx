import { memo } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  APP_HEADER_ACTION_BUTTON_CLASS,
  APP_HEADER_ACTION_ICON_CLASS,
} from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import { useGetHasUnreadQuery } from '@/services/api/notificationsApi'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

/**
 * Колокол уведомлений для шапки: лёгкий polling `has_unread` (раз в 30с) +
 * красная точка. По клику открывает инбокс через app-event.
 */
export const NotificationsBell = memo(function NotificationsBell() {
  const { t } = useTranslation()
  // Лёгкий индикатор: поллинг раз в 60с. refetchOnFocus НЕ включаем — в Telegram
  // WebView фокус дёргается постоянно и поверх поллинга давал шторм запросов.
  const { data } = useGetHasUnreadQuery(undefined, {
    pollingInterval: 60000,
  })
  const hasUnread = data?.data.has_unread ?? false

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => emitAppEvent(APP_EVENTS.OPEN_NOTIFICATIONS)}
      aria-label={t('notifications.openAria')}
      className={cn(APP_HEADER_ACTION_BUTTON_CLASS, 'relative')}
    >
      <Bell className={APP_HEADER_ACTION_ICON_CLASS} />
      {hasUnread ? (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-background bg-primary"
          aria-hidden="true"
        />
      ) : null}
    </Button>
  )
})

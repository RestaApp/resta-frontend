import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import { Loader } from '@/components/ui/loader'
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/services/api/notificationPreferencesApi'
import type { UpdateNotificationPreferenceRequest } from '@/services/api/notificationPreferencesApi'

const BOTTOM_OFFSET_PX = 76

type PreferenceKey = keyof Pick<
  import('@/services/api/notificationPreferencesApi').NotificationPreference,
  'urgent_notifications' | 'new_shifts_notifications' | 'application_notifications'
>

const PREFERENCE_KEYS: PreferenceKey[] = [
  'urgent_notifications',
  'new_shifts_notifications',
  'application_notifications',
]

const PREFERENCE_I18N: Record<PreferenceKey, { label: string; description: string }> = {
  urgent_notifications: { label: 'profile.notifications.urgent', description: 'profile.notifications.urgentDescription' },
  new_shifts_notifications: { label: 'profile.notifications.newShifts', description: 'profile.notifications.newShiftsDescription' },
  application_notifications: { label: 'profile.notifications.applications', description: 'profile.notifications.applicationsDescription' },
}

interface NotificationPreferencesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NotificationPreferencesDrawer = memo(({ open, onOpenChange }: NotificationPreferencesDrawerProps) => {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetNotificationPreferencesQuery(undefined, { skip: !open })
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateNotificationPreferencesMutation()

  const prefs = data?.data

  const handleToggle = useCallback(
    (key: PreferenceKey, checked: boolean) => {
      const payload: UpdateNotificationPreferenceRequest = {
        notification_preference: { [key]: checked },
      }
      updatePreferences(payload)
    },
    [updatePreferences]
  )

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      updatePreferences({
        notification_preference: {
          urgent_notifications: checked,
          new_shifts_notifications: checked,
          application_notifications: checked,
        },
      })
    },
    [updatePreferences]
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange} bottomOffsetPx={BOTTOM_OFFSET_PX}>
      <DrawerHeader>
        <DrawerTitle>{t('profile.notificationSettings')}</DrawerTitle>
        <DrawerDescription>{t('profile.notificationsDescription')}</DrawerDescription>
      </DrawerHeader>

      <div className="px-4 pb-6 space-y-2">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive py-4">{t('profile.loadError')}</p>
        )}
        {prefs && (
          <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 gap-3 bg-muted/30">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t('profile.notifications.all')}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('profile.notifications.allDescription')}
                </p>
              </div>
              <Switch
                checked={prefs.all_enabled}
                onCheckedChange={handleToggleAll}
                disabled={isUpdating}
              />
            </div>
            {PREFERENCE_KEYS.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{t(PREFERENCE_I18N[key].label)}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(PREFERENCE_I18N[key].description)}
                  </p>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                  disabled={isUpdating}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </Drawer>
  )
})
NotificationPreferencesDrawer.displayName = 'NotificationPreferencesDrawer'

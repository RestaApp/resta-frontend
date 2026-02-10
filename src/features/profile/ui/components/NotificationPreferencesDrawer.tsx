import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import { Loader } from '@/components/ui/loader'
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/services/api/notificationPreferencesApi'
import type {
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '@/services/api/notificationPreferencesApi'

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
  const [draftPrefs, setDraftPrefs] = useState<Pick<NotificationPreference, PreferenceKey> | null>(null)

  useEffect(() => {
    if (!open || !prefs) return
    setDraftPrefs({
      urgent_notifications: prefs.urgent_notifications,
      new_shifts_notifications: prefs.new_shifts_notifications,
      application_notifications: prefs.application_notifications,
    })
  }, [open, prefs])

  const allEnabled = useMemo(() => {
    if (!draftPrefs) return false
    return (
      draftPrefs.urgent_notifications &&
      draftPrefs.new_shifts_notifications &&
      draftPrefs.application_notifications
    )
  }, [draftPrefs])

  const handleToggle = useCallback((key: PreferenceKey, checked: boolean) => {
    setDraftPrefs(prev => (prev ? { ...prev, [key]: checked } : prev))
  }, [])

  const handleToggleAll = useCallback((checked: boolean) => {
    setDraftPrefs(prev =>
      prev
        ? {
          ...prev,
          urgent_notifications: checked,
          new_shifts_notifications: checked,
          application_notifications: checked,
        }
        : prev
    )
  }, [])

  const handleApply = useCallback(async () => {
    if (!draftPrefs) return
    const payload: UpdateNotificationPreferenceRequest = {
      notification_preference: {
        urgent_notifications: draftPrefs.urgent_notifications,
        new_shifts_notifications: draftPrefs.new_shifts_notifications,
        application_notifications: draftPrefs.application_notifications,
      },
    }
    await updatePreferences(payload)
  }, [draftPrefs, updatePreferences])

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next && prefs) {
        setDraftPrefs({
          urgent_notifications: prefs.urgent_notifications,
          new_shifts_notifications: prefs.new_shifts_notifications,
          application_notifications: prefs.application_notifications,
        })
      }
      onOpenChange(next)
    },
    [onOpenChange, prefs]
  )

  return (
    <Drawer open={open} onOpenChange={handleClose}>
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
        {draftPrefs && (
          <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 gap-3 bg-muted/30">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t('profile.notifications.all')}</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('profile.notifications.allDescription')}
                </p>
              </div>
              <Switch
                checked={allEnabled}
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
                  checked={draftPrefs[key]}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                  disabled={isUpdating}
                />
              </div>
            ))}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex-1 py-2 rounded-xl border-2 text-sm"
                style={{ borderColor: 'var(--border)' }}
                disabled={isUpdating}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2 rounded-xl text-white text-sm disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
                disabled={isUpdating}
              >
                {t('common.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
})
NotificationPreferencesDrawer.displayName = 'NotificationPreferencesDrawer'

import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerCloseButton,
} from '@/components/ui/drawer'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { Card } from '@/components/ui/card'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/utils/cn'
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/services/api/notificationPreferencesApi'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import type { ApiRole } from '@/types'
import type {
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '@/services/api/notificationPreferencesApi'

type PreferenceKey = keyof Pick<
  import('@/services/api/notificationPreferencesApi').NotificationPreference,
  'urgent_notifications' | 'new_shifts_notifications' | 'application_notifications'
>

const PREFERENCE_I18N: Record<
  PreferenceKey,
  { label: string; description: string; icon?: string }
> = {
  urgent_notifications: {
    label: 'profile.notifications.urgent',
    description: 'profile.notifications.urgentDescription',
    icon: '🔥',
  },
  new_shifts_notifications: {
    label: 'profile.notifications.newShifts',
    description: 'profile.notifications.newShiftsDescription',
  },
  application_notifications: {
    label: 'profile.notifications.applications',
    description: 'profile.notifications.applicationsDescription',
  },
}

const EMPLOYEE_NOTIFICATION_SECTIONS: Array<{
  id: string
  title: string
  keys: PreferenceKey[]
}> = [
  {
    id: 'shifts',
    title: 'profile.notifications.sections.shifts',
    keys: ['urgent_notifications', 'new_shifts_notifications', 'application_notifications'],
  },
]

const RESTAURANT_NOTIFICATION_SECTIONS: Array<{
  id: string
  title: string
  keys: PreferenceKey[]
}> = [
  {
    id: 'requests',
    title: 'profile.notifications.sections.requests',
    keys: ['application_notifications'],
  },
]

interface NotificationPreferencesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiRole: ApiRole | null
}

export const NotificationPreferencesDrawer = memo(
  ({ open, onOpenChange, apiRole }: NotificationPreferencesDrawerProps) => {
    const { t } = useTranslation()
    const { showToast } = useToast()
    const { data, isLoading, isError } = useGetNotificationPreferencesQuery(undefined, {
      skip: !open,
    })
    const [updatePreferences, { isLoading: isUpdating }] =
      useUpdateNotificationPreferencesMutation()

    const prefs = data?.data
    const [draftPrefs, setDraftPrefs] = useState<Pick<
      NotificationPreference,
      PreferenceKey
    > | null>(null)

    const prefsSnapshot = useMemo<Pick<NotificationPreference, PreferenceKey> | null>(() => {
      if (!prefs) return null
      return {
        urgent_notifications: prefs.urgent_notifications,
        new_shifts_notifications: prefs.new_shifts_notifications,
        application_notifications: prefs.application_notifications,
      }
    }, [prefs])

    const effectivePrefs = draftPrefs ?? prefsSnapshot

    const visibleSections = useMemo(() => {
      if (apiRole === 'restaurant') return RESTAURANT_NOTIFICATION_SECTIONS
      return EMPLOYEE_NOTIFICATION_SECTIONS
    }, [apiRole])

    const handleToggle = useCallback(
      (key: PreferenceKey, checked: boolean) => {
        setDraftPrefs(prev => {
          const base = prev ?? prefsSnapshot
          if (!base) return prev
          return { ...base, [key]: checked }
        })
      },
      [prefsSnapshot]
    )

    const handleApply = useCallback(async () => {
      if (!effectivePrefs) return
      const payload: UpdateNotificationPreferenceRequest = {
        notification_preference: {
          urgent_notifications: effectivePrefs.urgent_notifications,
          new_shifts_notifications: effectivePrefs.new_shifts_notifications,
          application_notifications: effectivePrefs.application_notifications,
        },
      }
      try {
        const response = await updatePreferences(payload).unwrap()
        setDraftPrefs(null)
        if (response.success) {
          onOpenChange(false)
        }
      } catch (error) {
        showToast(getErrorMessage(error) ?? t('saveErrorRetry'), 'error')
      }
    }, [effectivePrefs, onOpenChange, showToast, t, updatePreferences])

    const handleClose = useCallback(
      (next: boolean) => {
        if (!next) setDraftPrefs(null)
        onOpenChange(next)
      },
      [onOpenChange]
    )

    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerHeader className="border-b border-transparent pb-3">
          <div className="flex items-center justify-between gap-2">
            <DrawerCloseButton
              onClick={() => handleClose(false)}
              ariaLabel={t('common.back')}
              className="grid h-9 w-9 place-items-center rounded-sm p-0"
            />
            <DrawerTitle className="truncate text-center text-lg">
              {t('profile.notificationSettings')}
            </DrawerTitle>
            <div className="h-9 w-9" aria-hidden />
          </div>
        </DrawerHeader>

        <DrawerBody className="flex flex-col gap-3 pb-4 pt-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          )}
          {isError && <p className="text-sm text-destructive py-4">{t('profile.loadError')}</p>}
          {effectivePrefs
            ? visibleSections.map(section => (
                <section key={section.id} className="flex flex-col gap-2">
                  <div className={cn(SHIFT_CARD_META_CLASS, 'uppercase')}>
                    {t(section.title, { defaultValue: section.id })}
                  </div>
                  <Card className={cn(SHIFT_CARD_CLASS, 'overflow-hidden p-0')}>
                    <div className="flex flex-col divide-y divide-border/50 px-3">
                      {section.keys.map(key => {
                        const label = t(PREFERENCE_I18N[key].label)
                        return (
                          <div key={key} className="flex items-center justify-between gap-2 py-3">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <span className={SHIFT_CARD_LOGO_CLASS}>
                                {PREFERENCE_I18N[key].icon ?? label.slice(0, 1)}
                              </span>
                              <div className="min-w-0">
                                <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                                  {label}
                                </div>
                                <p className={SHIFT_CARD_SUB_CLASS}>
                                  {t(PREFERENCE_I18N[key].description)}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={effectivePrefs[key]}
                              onCheckedChange={checked => handleToggle(key, checked)}
                              disabled={isUpdating}
                              className="shrink-0"
                              ariaLabel={label}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </section>
              ))
            : null}
        </DrawerBody>
        {effectivePrefs ? (
          <DrawerFooter className="py-3">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => handleClose(false)}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isUpdating}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                variant="gradient"
                size="sm"
                className="flex-1"
                disabled={isUpdating}
              >
                {t('common.save')}
              </Button>
            </div>
          </DrawerFooter>
        ) : null}
      </Drawer>
    )
  }
)
NotificationPreferencesDrawer.displayName = 'NotificationPreferencesDrawer'

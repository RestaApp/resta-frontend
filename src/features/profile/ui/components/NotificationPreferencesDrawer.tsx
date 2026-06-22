import { memo, useCallback, useMemo, useState, createElement } from 'react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import { Bell, Briefcase, Flame, Repeat, Store } from 'lucide-react'
import { Drawer, DrawerBody, DrawerFrame, DrawerFooter } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { InlineAlert } from '@/components/ui/inline-alert'
import { SettingsRowsSkeleton } from '@/components/ui/settings-rows-skeleton'
import { Card } from '@/components/ui/card'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/services/api/notificationPreferencesApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import type { ApiRole } from '@/shared/types/roles.types'
import type {
  NotificationPreference,
  UpdateNotificationPreferenceRequest,
} from '@/services/api/notificationPreferencesApi'

type PreferenceKey = keyof Pick<
  import('@/services/api/notificationPreferencesApi').NotificationPreference,
  | 'urgent_notifications'
  | 'new_shifts_notifications'
  | 'application_notifications'
  | 'vacancy_notifications'
  | 'replacement_notifications'
>

const PREFERENCE_I18N: Record<PreferenceKey, { label: string; icon?: LucideIcon }> = {
  urgent_notifications: {
    label: 'profile.notifications.urgent',
    icon: Flame,
  },
  new_shifts_notifications: {
    label: 'profile.notifications.newShifts',
    icon: Briefcase,
  },
  application_notifications: {
    label: 'profile.notifications.applications',
    icon: Bell,
  },
  vacancy_notifications: {
    label: 'profile.notifications.vacancies',
    icon: Store,
  },
  replacement_notifications: {
    label: 'profile.notifications.replacements',
    icon: Repeat,
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
    keys: [
      'urgent_notifications',
      'new_shifts_notifications',
      'vacancy_notifications',
      'replacement_notifications',
      'application_notifications',
    ],
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
        vacancy_notifications: prefs.vacancy_notifications,
        replacement_notifications: prefs.replacement_notifications,
      }
    }, [prefs])

    const effectivePrefs = draftPrefs ?? prefsSnapshot

    const visibleSections = useMemo(() => {
      const sections =
        apiRole === 'restaurant' ? RESTAURANT_NOTIFICATION_SECTIONS : EMPLOYEE_NOTIFICATION_SECTIONS
      if (!prefs) return sections
      // Показываем только тумблеры, которые бэкенд реально отдаёт в ответе:
      // vacancy/replacement появятся автоматически, когда их добавят в API.
      return sections
        .map(section => ({
          ...section,
          keys: section.keys.filter(key => typeof prefs[key] === 'boolean'),
        }))
        .filter(section => section.keys.length > 0)
    }, [apiRole, prefs])

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
          vacancy_notifications: effectivePrefs.vacancy_notifications,
          replacement_notifications: effectivePrefs.replacement_notifications,
        },
      }
      try {
        const response = await updatePreferences(payload).unwrap()
        setDraftPrefs(null)
        if (response.success) {
          showToast(
            t('profile.notifications.saved', { defaultValue: 'Настройки сохранены' }),
            'success'
          )
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
        <DrawerFrame className="flex-1">
          <DrawerTitleBar
            title={t('profile.notificationSettings')}
            onClose={() => handleClose(false)}
          />

          <DrawerBody className="flex flex-col gap-3 pb-4 pt-2">
            {isLoading ? <SettingsRowsSkeleton rowCount={3} className="gap-3" /> : null}
            {isError && <InlineAlert message={t('profile.loadError')} className="my-4" />}
            {effectivePrefs
              ? visibleSections.map(section => (
                  <section key={section.id} className="flex flex-col gap-2">
                    <div className={PROFILE_SECTION_LABEL_CLASS}>
                      {t(section.title, { defaultValue: section.id })}
                    </div>
                    <Card className={cn(SHIFT_CARD_CLASS, 'overflow-hidden p-0')}>
                      <div className="flex flex-col divide-y divide-border/50 px-3">
                        {section.keys.map(key => {
                          const label = t(PREFERENCE_I18N[key].label)
                          const preferenceIcon = PREFERENCE_I18N[key].icon
                          return (
                            <div key={key} className="flex items-center justify-between gap-2 py-3">
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <span className={SHIFT_CARD_LOGO_CLASS}>
                                  {preferenceIcon
                                    ? createElement(preferenceIcon, {
                                        className: ICON_MD_CLASS,
                                        'aria-hidden': true,
                                      })
                                    : label.slice(0, 1)}
                                </span>
                                <div className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 truncate')}>
                                  {label}
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
            <DrawerFooter>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleClose(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                  disabled={isUpdating}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  variant="gradient"
                  size="md"
                  className="flex-1"
                  disabled={isUpdating}
                >
                  {t('common.save')}
                </Button>
              </div>
            </DrawerFooter>
          ) : null}
        </DrawerFrame>
      </Drawer>
    )
  }
)
NotificationPreferencesDrawer.displayName = 'NotificationPreferencesDrawer'

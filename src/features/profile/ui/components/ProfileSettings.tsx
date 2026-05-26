import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ChevronDown, HelpCircle, Languages, LogOut, Palette, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/utils/cn'
import type { Locale } from '@/shared/i18n/config'
import { SupportFormDrawer } from './SupportFormDrawer'
import { LanguageToggle } from './LanguageToggle'

interface ProfileSettingsProps {
  onLogout: () => void
  onNotificationSettingsClick?: () => void
  showNotificationSettings?: boolean
  /** ROLES_FRONTEND_SPEC §6: support_tickets недоступны для unverified */
  showSupport?: boolean
}

export function ProfileSettings({
  onLogout,
  onNotificationSettingsClick,
  showNotificationSettings = true,
  showSupport = true,
}: ProfileSettingsProps) {
  const { t, i18n } = useTranslation()
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false)
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false)

  const handleLanguageChange = useCallback(
    (locale: Locale) => {
      // ✅ мгновенно, как тема
      i18n.changeLanguage(locale)
      // ❌ на бэк не сохраняем
    },
    [i18n]
  )

  return (
    <div className="ui-density-stack">
      <h3 className={cn(PROFILE_SECTION_LABEL_CLASS, 'flex items-center gap-2')}>
        <Settings className="h-5 w-5 text-primary" />
        {t('profile.settings')}
      </h3>

      <div className="flex flex-col gap-3">
        <Card className="overflow-hidden rounded-lg border-border bg-card p-0">
          <button
            type="button"
            className={cn(
              SHIFT_CARD_INTERACTIVE_CLASS,
              'flex w-full items-center justify-between gap-2 p-3 text-left'
            )}
            onClick={() => setIsAppSettingsOpen(value => !value)}
            data-haptic="light"
            aria-expanded={isAppSettingsOpen}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={SHIFT_CARD_LOGO_CLASS}>
                <Settings className="h-5 w-5" />
              </span>
              <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                {t('profile.appSection')}
              </span>
            </div>
            <motion.span
              animate={{ rotate: isAppSettingsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-secondary text-muted-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          {isAppSettingsOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="flex flex-col divide-y divide-border/50 px-3">
                <div className="flex items-center justify-between gap-2 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(SHIFT_CARD_LOGO_CLASS, 'h-8 w-8 bg-secondary text-primary')}
                    >
                      <Languages className="h-4 w-4" />
                    </span>
                    <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('profile.language')}
                    </div>
                  </div>

                  {/* ✅ currentLocale берём из i18n напрямую */}
                  <LanguageToggle
                    currentLocale={i18n.language}
                    onLocaleChange={handleLanguageChange}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(SHIFT_CARD_LOGO_CLASS, 'h-8 w-8 bg-secondary text-primary')}
                    >
                      <Palette className="h-4 w-4" />
                    </span>
                    <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('profile.theme', 'Тема')}
                    </div>
                  </div>
                  <ThemeToggle />
                </div>

                {showNotificationSettings ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between gap-2 py-3 text-left transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                    onClick={onNotificationSettingsClick}
                    data-haptic="light"
                    disabled={!onNotificationSettingsClick}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(SHIFT_CARD_LOGO_CLASS, 'h-8 w-8 bg-secondary text-primary')}
                      >
                        <Settings className="h-4 w-4" />
                      </span>
                      <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                        {t('profile.notificationSettings')}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                  </motion.button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </Card>

        {showSupport ? (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              className={cn(
                SHIFT_CARD_CLASS,
                SHIFT_CARD_INTERACTIVE_CLASS,
                'flex w-full items-center gap-2 text-left'
              )}
              onClick={() => setIsSupportDrawerOpen(true)}
              data-haptic="light"
            >
              <span className={SHIFT_CARD_LOGO_CLASS}>
                <HelpCircle className="h-5 w-5" />
              </span>
              <span className={SHIFT_CARD_TITLE_CLASS}>{t('profile.support')}</span>
            </motion.button>

            <SupportFormDrawer open={isSupportDrawerOpen} onOpenChange={setIsSupportDrawerOpen} />
          </>
        ) : null}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className={cn(
            SHIFT_CARD_CLASS,
            SHIFT_CARD_INTERACTIVE_CLASS,
            'flex w-full items-center gap-2 text-left text-destructive hover:bg-destructive/10'
          )}
        >
          <span
            className={cn(
              SHIFT_CARD_LOGO_CLASS,
              'border border-destructive/30 bg-destructive/10 text-destructive'
            )}
          >
            <LogOut className="h-5 w-5" />
          </span>
          <span className={cn(SHIFT_CARD_TITLE_CLASS, 'text-destructive')}>
            {t('profile.logout')}
          </span>
        </motion.button>
      </div>
    </div>
  )
}

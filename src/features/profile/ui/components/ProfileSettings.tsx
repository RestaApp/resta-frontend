import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Settings, HelpCircle, LogOut, Moon, Languages } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle-compact'
import { DRAWER_SETTING_ROW_CLASS } from '@/components/ui/ui-patterns'
import type { Locale } from '@/shared/i18n/config'
import { SupportFormDrawer } from './SupportFormDrawer'
import { LanguageToggle } from './LanguageToggle'

interface ProfileSettingsProps {
  onLogout: () => void
  onNotificationSettingsClick?: () => void
  /** ROLES_FRONTEND_SPEC §6: support_tickets недоступны для unverified */
  showSupport?: boolean
}

export function ProfileSettings({
  onLogout,
  onNotificationSettingsClick,
  showSupport = true,
}: ProfileSettingsProps) {
  const { t, i18n } = useTranslation()
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false)

  const handleLanguageChange = useCallback(
    (locale: Locale) => {
      // ✅ мгновенно, как тема
      i18n.changeLanguage(locale)
      // ❌ на бэк не сохраняем
    },
    [i18n]
  )

  return (
    <div>
      <h3 className="text-lg font-semibold ui-density-mb flex items-center gap-2">
        <Settings className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
        {t('profile.settings')}
      </h3>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
              <div>
                <div className="text-sm font-medium">{t('profile.theme')}</div>
                <p className="text-xs text-muted-foreground">{t('profile.themeDescription')}</p>
              </div>
            </div>
            <ThemeToggleCompact />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
              <div>
                <div className="text-sm font-medium">{t('profile.language')}</div>
                <p className="text-xs text-muted-foreground">{t('profile.languageDescription')}</p>
              </div>
            </div>

            {/* ✅ currentLocale берём из i18n напрямую */}
            <LanguageToggle currentLocale={i18n.language} onLocaleChange={handleLanguageChange} />
          </div>
        </Card>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          className={`w-full text-left transition-colors hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50 ${DRAWER_SETTING_ROW_CLASS}`}
          onClick={onNotificationSettingsClick}
          disabled={!onNotificationSettingsClick}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 shrink-0" style={{ color: 'var(--purple-deep)' }} />
            <span>{t('profile.notificationSettings')}</span>
          </div>
        </motion.button>

        {showSupport ? (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left transition-colors hover:bg-muted/50 ${DRAWER_SETTING_ROW_CLASS}`}
              onClick={() => setIsSupportDrawerOpen(true)}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--purple-deep)' }} />
                <span>{t('profile.support')}</span>
              </div>
            </motion.button>

            <SupportFormDrawer open={isSupportDrawerOpen} onOpenChange={setIsSupportDrawerOpen} />
          </>
        ) : null}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className={`w-full text-left text-destructive transition-colors hover:bg-destructive/10 ${DRAWER_SETTING_ROW_CLASS}`}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 shrink-0" />
            <span>{t('profile.logout')}</span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}

import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Settings, HelpCircle, LogOut, Moon, Languages } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle-compact'
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n/config'
import i18n from '@/shared/i18n/config'
import { useUpdateUser } from '@/hooks/useUsers'
import { getCurrentUserId } from '@/utils/user'
import { SupportFormModal } from './SupportFormModal'

interface ProfileSettingsProps {
  onLogout: () => void
  onNotificationSettingsClick?: () => void
}

export const ProfileSettings = memo(({ onLogout, onNotificationSettingsClick }: ProfileSettingsProps) => {
  const { t, i18n: i18nInstance } = useTranslation()
  const { updateUser } = useUpdateUser()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

  const handleLanguageChange = useCallback(
    async (locale: Locale) => {
      i18n.changeLanguage(locale)
      const userId = getCurrentUserId()
      if (userId) {
        try {
          await updateUser(userId, { user: { language: locale } })
        } catch {
          // язык в UI уже обновлён, бэкенд обновим при следующем изменении
        }
      }
    },
    [updateUser]
  )

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('profile.settings')}</h3>
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
            <div className="flex gap-2">
              {SUPPORTED_LOCALES.map((locale) => (
                <button
                  key={locale}
                  type="button"
                  onClick={() => handleLanguageChange(locale)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i18nInstance.language === locale
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {t(locale === 'ru' ? 'localeRu' : 'localeEn')}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
          onClick={onNotificationSettingsClick}
        >
          <Settings className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
          <span>{t('profile.notificationSettings')}</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
          onClick={() => setIsSupportModalOpen(true)}
        >
          <HelpCircle className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
          <span>{t('profile.support')}</span>
        </motion.button>

        <SupportFormModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('profile.logout')}</span>
        </motion.button>
      </div>
    </div>
  )
})
ProfileSettings.displayName = 'ProfileSettings'

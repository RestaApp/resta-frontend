import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  BookOpen,
  ChevronDown,
  Compass,
  FileText,
  HelpCircle,
  Languages,
  LogOut,
  Palette,
  Scale,
  Settings,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_SUB_LOGO_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { setAppLanguage, type Locale } from '@/shared/i18n/config'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { SupportFormDrawer } from './SupportFormDrawer'
import { LanguageToggle } from './LanguageToggle'
import { DeleteAccountDrawer } from '@/shared/ui/legal/DeleteAccountDrawer'

interface ProfileSettingsProps {
  onLogout: () => void
  onNotificationSettingsClick?: () => void
  showNotificationSettings?: boolean
  /** ROLES_FRONTEND_SPEC §6: support_tickets недоступны для unverified */
  showSupport?: boolean
  onPrivacyPress?: () => void
  onTermsPress?: () => void
  onFaqPress?: () => void
  onDeleteAccount?: () => Promise<void>
}

export const ProfileSettings = memo(function ProfileSettings({
  onLogout,
  onNotificationSettingsClick,
  showNotificationSettings = true,
  showSupport = true,
  onPrivacyPress,
  onTermsPress,
  onFaqPress,
  onDeleteAccount,
}: ProfileSettingsProps) {
  const { t, i18n } = useTranslation()
  const [isSupportDrawerOpen, setIsSupportDrawerOpen] = useState(false)
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false)
  const [isLegalOpen, setIsLegalOpen] = useState(false)
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)

  const handleLanguageChange = useCallback((locale: Locale) => {
    void setAppLanguage(locale)
  }, [])

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
                    <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
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
                    <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
                      <Palette className="h-4 w-4" />
                    </span>
                    <div className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('profile.theme')}
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
                      <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
                        <Settings className="h-4 w-4" />
                      </span>
                      <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                        {t('profile.notificationSettings')}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                  </motion.button>
                ) : null}

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-between gap-2 py-3 text-left transition-colors hover:text-primary"
                  onClick={() => emitAppEvent(APP_EVENTS.START_ROLE_TOUR)}
                  data-haptic="light"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
                      <Compass className="h-4 w-4" />
                    </span>
                    <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('onboarding.tour.replayCta')}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </Card>

        {onFaqPress ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            className={cn(
              SHIFT_CARD_CLASS,
              SHIFT_CARD_INTERACTIVE_CLASS,
              'flex w-full items-center gap-2 text-left'
            )}
            onClick={onFaqPress}
            data-haptic="light"
          >
            <span className={SHIFT_CARD_LOGO_CLASS}>
              <BookOpen className="h-5 w-5" />
            </span>
            <span className={SHIFT_CARD_TITLE_CLASS}>{t('faq.title')}</span>
          </motion.button>
        ) : null}

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

        <Card className="overflow-hidden rounded-lg border-border bg-card p-0">
          <button
            type="button"
            className={cn(
              SHIFT_CARD_INTERACTIVE_CLASS,
              'flex w-full items-center justify-between gap-2 p-3 text-left'
            )}
            onClick={() => setIsLegalOpen(v => !v)}
            data-haptic="light"
            aria-expanded={isLegalOpen}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={SHIFT_CARD_LOGO_CLASS}>
                <Scale className="h-5 w-5" />
              </span>
              <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                {t('legal.legalDocuments')}
              </span>
            </div>
            <motion.span
              animate={{ rotate: isLegalOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-secondary text-muted-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          {isLegalOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="flex flex-col divide-y divide-border/50 px-3">
                {onPrivacyPress ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center gap-2 py-3 text-left transition-colors hover:text-primary"
                    onClick={onPrivacyPress}
                    data-haptic="light"
                  >
                    <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('legal.privacyPolicy')}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-muted-foreground" />
                  </motion.button>
                ) : null}
                {onTermsPress ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center gap-2 py-3 text-left transition-colors hover:text-primary"
                    onClick={onTermsPress}
                    data-haptic="light"
                  >
                    <span className={SHIFT_CARD_SUB_LOGO_CLASS}>
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
                      {t('legal.termsOfService')}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-muted-foreground" />
                  </motion.button>
                ) : null}
                {onDeleteAccount ? (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center gap-2 py-3 text-left text-destructive transition-colors hover:bg-destructive/10"
                    onClick={() => setIsDeleteDrawerOpen(true)}
                    data-haptic="light"
                  >
                    <span
                      className={cn(
                        SHIFT_CARD_LOGO_CLASS,
                        'h-8 w-8 border border-destructive/30 bg-destructive/10 text-destructive [&_svg]:text-destructive'
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                    <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate text-destructive')}>
                      {t('legal.deleteAccount.title')}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-muted-foreground" />
                  </motion.button>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </Card>

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
              'border border-destructive/30 bg-destructive/10 text-destructive [&_svg]:text-destructive'
            )}
          >
            <LogOut className="h-5 w-5" />
          </span>
          <span className={cn(SHIFT_CARD_TITLE_CLASS, 'text-destructive')}>
            {t('profile.logout')}
          </span>
        </motion.button>

        {onDeleteAccount ? (
          <DeleteAccountDrawer
            open={isDeleteDrawerOpen}
            onOpenChange={setIsDeleteDrawerOpen}
            onDeleteConfirmed={onDeleteAccount}
          />
        ) : null}
      </div>
    </div>
  )
})

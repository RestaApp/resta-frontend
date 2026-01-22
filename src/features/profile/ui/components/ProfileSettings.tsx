import { memo } from 'react'
import { motion } from 'motion/react'
import { Settings, HelpCircle, LogOut, Moon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle-compact'

interface ProfileSettingsProps {
  onLogout: () => void
}

export const ProfileSettings = memo(({ onLogout }: ProfileSettingsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Настройки</h3>
      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
              <div>
                <div className="text-sm font-medium">Тема оформления</div>
                <p className="text-xs text-muted-foreground">Светлая или темная тема</p>
              </div>
            </div>
            <ThemeToggleCompact />
          </div>
        </Card>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
        >
          <Settings className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
          <span>Настройки уведомлений</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
        >
          <HelpCircle className="w-5 h-5" style={{ color: 'var(--purple-deep)' }} />
          <span>Поддержка Resta</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full p-4 rounded-xl border border-border text-left flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти из аккаунта</span>
        </motion.button>
      </div>
    </div>
  )
})
ProfileSettings.displayName = 'ProfileSettings'

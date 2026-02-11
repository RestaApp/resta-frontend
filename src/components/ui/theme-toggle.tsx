import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from '@/hooks/useTheme'

interface ThemeToggleProps {
  size?: number
}

export const ThemeToggle = ({ size = 20 }: ThemeToggleProps) => {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const handleToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t('aria.toggleTheme')}
      className="rounded-full p-2 transition-colors hover:bg-muted/50"
    >
      <motion.div
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Moon width={size} height={size} />
        ) : (
          <Sun width={size} height={size} />
        )}
      </motion.div>
    </button>
  )
}

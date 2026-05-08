import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getCurrentTheme, toggleTheme, type ResolvedTheme } from '@/utils/theme'

interface ThemeToggleProps {
  className?: string
  ariaLabel?: string
}

export const ThemeToggle = ({ className, ariaLabel = 'Сменить тему' }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<ResolvedTheme>(() => getCurrentTheme())

  const handleClick = () => setTheme(toggleTheme())

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-xl',
        'bg-secondary text-foreground transition-colors hover:bg-secondary/80',
        'border border-border',
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

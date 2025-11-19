import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const theme = localStorage.getItem('theme')
    if (theme) {
      return theme === 'dark'
    }
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      setIsDark(false)
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.add('dark')
      setIsDark(true)
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-muted/50 transition-colors"
      aria-label="Переключить тему"
    >
      {isDark ? (
        <Sun className="w-6 h-6" strokeWidth={2} />
      ) : (
        <Moon className="w-6 h-6" strokeWidth={2} />
      )}
    </button>
  )
}

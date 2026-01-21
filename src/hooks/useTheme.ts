import { useCallback, useEffect, useState } from 'react'
import {
  getInitialTheme,
  getSavedTheme,
  setTheme,
  toggleTheme,
  THEME_CHANGE_EVENT,
  type Theme,
} from '@/utils/theme'

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<Theme>
      if (ce.detail) setThemeState(ce.detail)
    }

    window.addEventListener(THEME_CHANGE_EVENT, onChange)

    // если нет сохранённой темы — реагируем на смену системной
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (getSavedTheme()) return
      const next: Theme = mq.matches ? 'dark' : 'light'
      setTheme(next)
    }

    mq?.addEventListener?.('change', onSystemChange)

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onChange)
      mq?.removeEventListener?.('change', onSystemChange)
    }
  }, [])

  const set = useCallback((next: Theme) => setTheme(next), [])
  const toggle = useCallback(() => toggleTheme(), [])

  return { theme, setTheme: set, toggleTheme: toggle }
}
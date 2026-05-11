import { getLocalStorageItem, setLocalStorageItem } from './localStorage'

const THEME_KEY = 'resta-theme'

export type ResolvedTheme = 'dark' | 'light'

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const readStoredTheme = (): ResolvedTheme => {
  const stored = getLocalStorageItem(THEME_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

const applyTheme = (theme: ResolvedTheme) => {
  if (!isBrowser()) return
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle('dark', theme === 'dark')
}

export const getCurrentTheme = (): ResolvedTheme => {
  if (!isBrowser()) return 'dark'
  return (document.documentElement.dataset.theme as ResolvedTheme | undefined) ?? readStoredTheme()
}

export const setTheme = (theme: ResolvedTheme) => {
  applyTheme(theme)
  setLocalStorageItem(THEME_KEY, theme)
}

export const toggleTheme = (): ResolvedTheme => {
  const next: ResolvedTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

export const initTheme = () => {
  setTheme(readStoredTheme())
}

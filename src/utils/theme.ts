import { getLocalStorageItem, setLocalStorageItem } from './localStorage'

export type Theme = 'light' | 'dark'

export const THEME_KEY = 'resta-theme'
export const THEME_CHANGE_EVENT = 'theme:change' as const

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

export const applyTheme = (theme: Theme) => {
  if (!isBrowser()) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const saveTheme = (theme: Theme) => {
  setLocalStorageItem(THEME_KEY, theme)
}

export const getSavedTheme = (): Theme | null => {
  const v = getLocalStorageItem(THEME_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

export const getSystemTheme = (): Theme => {
  if (!isBrowser() || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getInitialTheme = (): Theme => getSavedTheme() ?? getSystemTheme()

export const initTheme = () => {
  const theme = getInitialTheme()
  applyTheme(theme)
  // опционально: если хочешь, чтобы отсутствие сохранённой темы фиксировалось сразу:
  // saveTheme(theme)
}

/**
 * Установить тему явно: применить + сохранить + оповестить подписчиков
 */
export const setTheme = (theme: Theme) => {
  applyTheme(theme)
  saveTheme(theme)

  if (!isBrowser()) return
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }))
}

export const getCurrentTheme = (): Theme => {
  if (!isBrowser()) return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export const toggleTheme = (): Theme => {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

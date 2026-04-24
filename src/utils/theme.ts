import { setLocalStorageItem } from './localStorage'

export const THEME_KEY = 'resta-theme'

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const applyTheme = () => {
  if (!isBrowser()) return
  document.documentElement.classList.add('dark')
}

export const initTheme = () => {
  applyTheme()
  setLocalStorageItem(THEME_KEY, 'dark')
}

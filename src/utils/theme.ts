export type Theme = 'light' | 'dark'

export const THEME_KEY = 'resta-theme'

export const applyTheme = (newTheme: Theme) => {
  const root = document.documentElement
  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const saveTheme = (newTheme: Theme) => {
  try {
    localStorage.setItem(THEME_KEY, newTheme)
  } catch {
    /* silent */
  }
}

export const getSavedTheme = (): Theme | null => {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
    return null
  } catch {
    return null
  }
}

export const getInitialTheme = (): Theme => {
  const saved = getSavedTheme()
  if (saved) return saved
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export const initTheme = () => {
  const theme = getInitialTheme()
  applyTheme(theme)
}

export const toggleTheme = (): Theme => {
  const root = document.documentElement
  const current: Theme = root.classList.contains('dark') ? 'dark' : 'light'
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  saveTheme(next)
  return next
}



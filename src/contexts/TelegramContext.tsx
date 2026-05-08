import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useTelegramAuth } from './telegram/useTelegramAuth'
import { useTelegramFullscreen } from './telegram/useTelegramFullscreen'
import { useTelegramScrollLock } from './telegram/useTelegramScrollLock'
import { useTelegramAutoLocale } from './telegram/useTelegramAutoLocale'
import type { TelegramWebApp } from './telegram/utils'

interface TelegramContextValue {
  isReady: boolean
  telegram: TelegramWebApp | null
  isVerticalSwipesEnabled: boolean
  isFullscreen: boolean
  isOrientationLocked: boolean
  requestFullscreen: () => void
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined)

interface TelegramProviderProps {
  children: ReactNode
}

/**
 * Provider оркестрирует subsystem hooks:
 *  • `useTelegramAuth`        — login lifecycle, `isReady`, инстанс WebApp;
 *  • `useTelegramFullscreen`  — fullscreen state + `requestFullscreen` API;
 *  • `useTelegramScrollLock`  — блокировка scroll body/html в fullscreen;
 *  • `useTelegramAutoLocale`  — автоопределение языка для неавторизованных.
 *
 * Public API контекста (TelegramContextValue) сохранён 1:1 — потребители
 * `useTelegram` не меняются.
 */
export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const { isReady, telegram } = useTelegramAuth()
  const { isFullscreen, requestFullscreen } = useTelegramFullscreen(telegram)

  useTelegramScrollLock(isFullscreen)
  useTelegramAutoLocale(isReady)

  const isVerticalSwipesEnabled = telegram?.isVerticalSwipesEnabled ?? true
  const isOrientationLocked = telegram?.isOrientationLocked ?? false

  const value = useMemo<TelegramContextValue>(
    () => ({
      isReady,
      telegram,
      isVerticalSwipesEnabled,
      isFullscreen,
      isOrientationLocked,
      requestFullscreen,
    }),
    [
      isReady,
      telegram,
      isVerticalSwipesEnabled,
      isFullscreen,
      isOrientationLocked,
      requestFullscreen,
    ]
  )

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTelegram = (): TelegramContextValue => {
  const ctx = useContext(TelegramContext)
  if (!ctx) throw new Error('useTelegram должен использоваться внутри TelegramProvider')
  return ctx
}

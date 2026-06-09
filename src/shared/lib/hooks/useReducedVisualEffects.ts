import { useMemo } from 'react'
import { useReducedMotion } from 'motion/react'

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

const isIosWebView = () => {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent || ''
  const isIos = /iP(hone|ad|od)/i.test(ua)
  const isTelegram = /Telegram/i.test(ua)
  const isStandaloneSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)

  return isIos && (isTelegram || !isStandaloneSafari)
}

const hasConstrainedHardware = () => {
  if (typeof navigator === 'undefined') return false

  const nav = navigator as NavigatorWithDeviceMemory
  const memoryIsLow = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const coresAreLow = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4

  return memoryIsLow || coresAreLow
}

/**
 * Убирает самые дорогие визуальные эффекты в WebView, где CSS blur/backdrop-filter
 * часто просаживают кадры сильнее, чем сами transform-анимации.
 */
export const useReducedVisualEffects = () => {
  const reduceMotion = useReducedMotion()

  return useMemo(() => {
    return Boolean(reduceMotion || isIosWebView() || hasConstrainedHardware())
  }, [reduceMotion])
}

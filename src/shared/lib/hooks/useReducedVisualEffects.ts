import { useMemo } from 'react'
import { useReducedMotion } from 'motion/react'

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

const hasConstrainedHardware = () => {
  if (typeof navigator === 'undefined') return false

  const nav = navigator as NavigatorWithDeviceMemory
  const memoryIsLow = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const coresAreLow = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4

  return memoryIsLow || coresAreLow
}

/**
 * Убирает самые дорогие визуальные эффекты (blur/backdrop-filter) только там,
 * где это действительно оправдано: при системном prefers-reduced-motion либо на
 * реально слабом железе. Платформа (iOS/WebView) больше не глушит эффекты —
 * градиенты и анимации должны выглядеть одинаково на всех устройствах.
 */
export const useReducedVisualEffects = () => {
  const reduceMotion = useReducedMotion()

  return useMemo(() => {
    return Boolean(reduceMotion || hasConstrainedHardware())
  }, [reduceMotion])
}

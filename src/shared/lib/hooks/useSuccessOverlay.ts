import { useCallback, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'
import type { ResultOverlayAction } from '@/components/ui/result-overlay'

export interface SuccessOverlayState {
  open: boolean
  title: ReactNode
  description?: ReactNode
  primaryAction?: ResultOverlayAction
  secondaryAction?: ResultOverlayAction
  icon?: ComponentType<LucideProps>
}

const CLOSED_STATE: SuccessOverlayState = { open: false, title: '' }

/**
 * Простая state-машина для полноэкранного success-overlay.
 * SRP: один источник правды о том, какой текст показать и какие действия предложить.
 */
export const useSuccessOverlay = () => {
  const [state, setState] = useState<SuccessOverlayState>(CLOSED_STATE)

  const showSuccess = useCallback((next: Omit<SuccessOverlayState, 'open'>) => {
    setState({ ...next, open: true })
  }, [])

  const closeSuccess = useCallback(() => {
    setState(prev => ({ ...prev, open: false }))
  }, [])

  return { successState: state, showSuccess, closeSuccess }
}

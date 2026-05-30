import { ResultOverlay } from './result-overlay'
import type { SuccessOverlayState } from '@/hooks/useSuccessOverlay'

interface SuccessOverlayProps {
  state: SuccessOverlayState
  onClose: () => void
}

export const SuccessOverlay = ({ state, onClose }: SuccessOverlayProps) => (
  <ResultOverlay
    open={state.open}
    tone="success"
    title={state.title}
    description={state.description}
    primaryAction={state.primaryAction}
    secondaryAction={state.secondaryAction}
    icon={state.icon}
    onClose={onClose}
  />
)

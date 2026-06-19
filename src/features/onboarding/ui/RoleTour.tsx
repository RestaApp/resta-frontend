import { memo } from 'react'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { useRoleTour } from '../model/useRoleTour'
import { RoleTourOverlay } from './RoleTourOverlay'

interface RoleTourProps {
  role: UiRole
  onTabChange: (tab: Tab) => void
}

/**
 * Coach-marks тур «что где зачем» по вкладкам роли. Авто-старт один раз,
 * повтор — через профиль (событие START_ROLE_TOUR). Монтируется в Dashboard.
 */
export const RoleTour = memo(function RoleTour({ role, onTabChange }: RoleTourProps) {
  const { activeStep, stepIndex, steps, isLast, canGoBack, next, prev, finish } = useRoleTour({
    role,
    onTabChange,
  })

  if (activeStep == null || stepIndex == null) return null

  return (
    <RoleTourOverlay
      step={activeStep}
      stepIndex={stepIndex}
      total={steps.length}
      isLast={isLast}
      canGoBack={canGoBack}
      onNext={next}
      onPrev={prev}
      onSkip={finish}
    />
  )
})

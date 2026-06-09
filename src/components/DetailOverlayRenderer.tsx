import { lazy } from 'react'
import { PageSuspense } from '@/components/ui/PageSuspense'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'

const ShiftDetailOverlay = lazy(() =>
  import('./ShiftDetailOverlay').then(m => ({ default: m.ShiftDetailOverlay }))
)
const UserProfileOverlay = lazy(() =>
  import('./UserProfileOverlay').then(m => ({ default: m.UserProfileOverlay }))
)

export function DetailOverlayRenderer() {
  const { overlay, isDeepLinked, closeOverlay } = useDetailOverlay()

  if (!overlay || !isDeepLinked) return null

  if (overlay.type === 'shift' || overlay.type === 'vacancy') {
    return (
      <PageSuspense>
        <ShiftDetailOverlay id={overlay.id} onClose={closeOverlay} />
      </PageSuspense>
    )
  }

  if (overlay.type === 'user') {
    return (
      <PageSuspense>
        <UserProfileOverlay id={overlay.id} onClose={closeOverlay} />
      </PageSuspense>
    )
  }

  return null
}

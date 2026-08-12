import { useCallback, useRef, useState, type ReactNode } from 'react'
import { type DetailOverlay, buildDetailPath } from './detailPaths'
import { DetailOverlayContext } from './overlayContextHooks'

export function DetailOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlayState] = useState<DetailOverlay | null>(null)
  const overlayRef = useRef<DetailOverlay | null>(null)
  const deepLinkedRef = useRef(false)
  const [isDeepLinked, setIsDeepLinked] = useState(false)

  const pushOverlay = useCallback((next: DetailOverlay, renderGlobally = false) => {
    const current = overlayRef.current
    if (current?.type === next.type && current.id === next.id) {
      if (renderGlobally) {
        deepLinkedRef.current = true
        setIsDeepLinked(true)
      }
      return
    }

    deepLinkedRef.current = renderGlobally
    setIsDeepLinked(renderGlobally)
    overlayRef.current = next
    setOverlayState(next)
    window.history.pushState({ detail: true }, '', buildDetailPath(next))
  }, [])

  const setOverlay = useCallback((next: DetailOverlay | null) => {
    if (next) {
      deepLinkedRef.current = true
      setIsDeepLinked(true)
    } else {
      deepLinkedRef.current = false
      setIsDeepLinked(false)
    }
    overlayRef.current = next
    setOverlayState(next)
  }, [])

  const openShiftDetail = useCallback(
    (id: number) => pushOverlay({ type: 'shift', id }),
    [pushOverlay]
  )
  const openGlobalShiftDetail = useCallback(
    (id: number) => pushOverlay({ type: 'shift', id }, true),
    [pushOverlay]
  )
  const openVacancyDetail = useCallback(
    (id: number) => pushOverlay({ type: 'vacancy', id }),
    [pushOverlay]
  )
  const openUserProfile = useCallback(
    (id: number) => pushOverlay({ type: 'user', id }),
    [pushOverlay]
  )

  const closeOverlay = useCallback(() => {
    if (!overlay) return
    window.history.back()
  }, [overlay])

  const replaceOverlayWithPath = useCallback((path: string) => {
    deepLinkedRef.current = false
    setIsDeepLinked(false)
    overlayRef.current = null
    setOverlayState(null)
    window.history.replaceState(null, '', path)
  }, [])

  return (
    <DetailOverlayContext.Provider
      value={{
        overlay,
        isDeepLinked,
        openShiftDetail,
        openGlobalShiftDetail,
        openVacancyDetail,
        openUserProfile,
        closeOverlay,
        replaceOverlayWithPath,
        setOverlay,
      }}
    >
      {children}
    </DetailOverlayContext.Provider>
  )
}

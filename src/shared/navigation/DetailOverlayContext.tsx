import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { type DetailOverlay, buildDetailPath } from './detailPaths'

interface DetailOverlayContextValue {
  overlay: DetailOverlay | null
  /** True when overlay was opened by deep link, not by a feature page. */
  isDeepLinked: boolean
  openShiftDetail: (id: number) => void
  openVacancyDetail: (id: number) => void
  openUserProfile: (id: number) => void
  closeOverlay: () => void
  setOverlay: (overlay: DetailOverlay | null) => void
}

const DetailOverlayContext = createContext<DetailOverlayContextValue | null>(null)

export function DetailOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlayState] = useState<DetailOverlay | null>(null)
  const deepLinkedRef = useRef(false)
  const [isDeepLinked, setIsDeepLinked] = useState(false)

  const pushOverlay = useCallback((next: DetailOverlay) => {
    deepLinkedRef.current = false
    setIsDeepLinked(false)
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
    setOverlayState(next)
  }, [])

  const openShiftDetail = useCallback(
    (id: number) => pushOverlay({ type: 'shift', id }),
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

  return (
    <DetailOverlayContext.Provider
      value={{
        overlay,
        isDeepLinked,
        openShiftDetail,
        openVacancyDetail,
        openUserProfile,
        closeOverlay,
        setOverlay,
      }}
    >
      {children}
    </DetailOverlayContext.Provider>
  )
}

export function useDetailOverlay() {
  const ctx = useContext(DetailOverlayContext)
  if (!ctx) throw new Error('useDetailOverlay must be used within DetailOverlayProvider')
  const { setOverlay: _, ...rest } = ctx
  return rest
}

export function useDetailOverlayInternal(): DetailOverlayContextValue {
  const ctx = useContext(DetailOverlayContext)
  if (!ctx) throw new Error('useDetailOverlayInternal must be used within DetailOverlayProvider')
  return ctx
}

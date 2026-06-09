import { createContext, useContext } from 'react'
import type { DetailOverlay } from './detailPaths'

export interface DetailOverlayContextValue {
  overlay: DetailOverlay | null
  /** True when overlay was opened by deep link, not by a feature page. */
  isDeepLinked: boolean
  openShiftDetail: (id: number) => void
  openVacancyDetail: (id: number) => void
  openUserProfile: (id: number) => void
  closeOverlay: () => void
  replaceOverlayWithPath: (path: string) => void
  setOverlay: (overlay: DetailOverlay | null) => void
}

export const DetailOverlayContext = createContext<DetailOverlayContextValue | null>(null)

export function useDetailOverlay(): Omit<DetailOverlayContextValue, 'setOverlay'> {
  const ctx = useContext(DetailOverlayContext)
  if (!ctx) throw new Error('useDetailOverlay must be used within DetailOverlayProvider')
  return {
    overlay: ctx.overlay,
    isDeepLinked: ctx.isDeepLinked,
    openShiftDetail: ctx.openShiftDetail,
    openVacancyDetail: ctx.openVacancyDetail,
    openUserProfile: ctx.openUserProfile,
    closeOverlay: ctx.closeOverlay,
    replaceOverlayWithPath: ctx.replaceOverlayWithPath,
  }
}

export function useDetailOverlayInternal(): DetailOverlayContextValue {
  const ctx = useContext(DetailOverlayContext)
  if (!ctx) throw new Error('useDetailOverlayInternal must be used within DetailOverlayProvider')
  return ctx
}

import { useEffect, useRef, type RefObject } from 'react'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { useScrollContainerLock } from '@/shared/lib/hooks/useScrollContainerLock'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { useDropdownAutoScroll } from './useDropdownAutoScroll'
import { useEffectivePortaled } from './useEffectivePortaled'

interface UseSelectDropdownShellOptions {
  isOpen: boolean
  portaled?: boolean
  withOverlay?: boolean
  bottomOffsetPx?: number
  onDismiss: () => void
  containerRef?: RefObject<HTMLDivElement | null>
  dropdownRef?: RefObject<HTMLDivElement | null>
}

/** Общая оболочка inline/portal dropdown: dismiss, scroll-lock, auto-scroll. */
export const useSelectDropdownShell = ({
  isOpen,
  portaled = false,
  withOverlay = false,
  bottomOffsetPx = BOTTOM_NAV_HEIGHT_PX,
  onDismiss,
  containerRef: externalContainerRef,
  dropdownRef: externalDropdownRef,
}: UseSelectDropdownShellOptions) => {
  const internalContainerRef = useRef<HTMLDivElement>(null)
  const internalDropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = externalContainerRef ?? internalContainerRef
  const dropdownRef = externalDropdownRef ?? internalDropdownRef

  const effectivePortaled = useEffectivePortaled(isOpen, containerRef, portaled)

  useBodyScrollLock(isOpen && withOverlay)
  useScrollContainerLock(isOpen, containerRef)

  useDropdownAutoScroll({
    isOpen,
    containerRef,
    bottomOffsetPx,
    portaled: effectivePortaled,
    enabled: !effectivePortaled,
  })

  useEffect(() => {
    if (!isOpen || withOverlay) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target) || dropdownRef.current?.contains(target)) return
      onDismiss()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [containerRef, dropdownRef, isOpen, onDismiss, withOverlay])

  return { containerRef, dropdownRef, effectivePortaled }
}

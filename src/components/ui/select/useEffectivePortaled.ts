import { type RefObject } from 'react'

/** В drawer/modal — portal + fixed под якорем, чтобы список был поверх контента без сдвига layout. */
export const useEffectivePortaled = (
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  portaled: boolean
): boolean => {
  if (!isOpen) return false
  const insideDialog = containerRef.current?.closest('[role="dialog"]') != null
  return portaled || insideDialog
}

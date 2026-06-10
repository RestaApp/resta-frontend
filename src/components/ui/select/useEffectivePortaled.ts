import { useLayoutEffect, useState, type RefObject } from 'react'

/** В drawer/modal — portal + fixed под якорем, чтобы список был поверх контента без сдвига layout. */
export const useEffectivePortaled = (
  isOpen: boolean,
  containerRef: RefObject<HTMLElement | null>,
  portaled: boolean
): boolean => {
  const [effectivePortaled, setEffectivePortaled] = useState(false)

  useLayoutEffect(() => {
    if (!isOpen) {
      setEffectivePortaled(false)
      return
    }

    const insideDialog = containerRef.current?.closest('[role="dialog"]') != null
    setEffectivePortaled(portaled || insideDialog)
  }, [isOpen, portaled, containerRef])

  return effectivePortaled
}

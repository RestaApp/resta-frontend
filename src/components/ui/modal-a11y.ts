import { createContext, useContext } from 'react'

export const ModalA11yContext = createContext<{
  titleId: string
  descriptionId: string
} | null>(null)

export function useModalA11y() {
  return useContext(ModalA11yContext)
}

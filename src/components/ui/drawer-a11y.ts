import { createContext, useContext } from 'react'

export const DrawerA11yContext = createContext<{
  titleId: string
  descriptionId: string
} | null>(null)

export function useDrawerA11y() {
  return useContext(DrawerA11yContext)
}

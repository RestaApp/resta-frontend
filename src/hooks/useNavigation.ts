/**
 * Хук для управления навигацией (без табов)
 */

import { useCallback } from 'react'
import type { Screen } from '@/types'
import { VALID_SCREENS, ROUTES } from '@/constants/routes'

interface UseNavigationProps {
  setCurrentScreen: (screen: Screen) => void
}

export const useNavigation = ({ setCurrentScreen }: UseNavigationProps) => {
  const navigate = useCallback(
    (destination: string) => {
      if (VALID_SCREENS.includes(destination as Screen)) {
        setCurrentScreen(destination as Screen)
      }
    },
    [setCurrentScreen]
  )

  const back = useCallback(() => {
    setCurrentScreen(ROUTES.HOME)
  }, [setCurrentScreen])

  return { navigate, back }
}
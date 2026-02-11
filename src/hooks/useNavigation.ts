import { useCallback } from 'react'
import type { Screen } from '@/types'
import { ROUTES } from '@/constants/routes'

interface UseNavigationProps {
  setCurrentScreen: (screen: Screen) => void
}

export const useNavigation = ({ setCurrentScreen }: UseNavigationProps) => {
  const navigate = useCallback(
    (screen: Screen) => {
      setCurrentScreen(screen)
    },
    [setCurrentScreen]
  )

  const back = useCallback(() => {
    setCurrentScreen(ROUTES.HOME)
  }, [setCurrentScreen])

  return { navigate, back }
}

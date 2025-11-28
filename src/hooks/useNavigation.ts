/**
 * Хук для управления навигацией
 */

import { useCallback } from 'react'
import type { Screen, Tab } from '../types'
import { VALID_SCREENS } from '../constants/routes'
import { SCREEN_TO_TAB_MAP } from '../constants/navigation'
import { ROUTES } from '../constants/routes'
import { logger } from '../utils/logger'

interface UseNavigationProps {
  setCurrentScreen: (screen: Screen) => void
  setActiveTab: (tab: Tab) => void
}

export function useNavigation({ setCurrentScreen, setActiveTab }: UseNavigationProps) {
  const navigate = useCallback(
    (destination: string) => {
      if (VALID_SCREENS.includes(destination as Screen)) {
        const screen = destination as Screen
        setCurrentScreen(screen)

        // Синхронизация таба с экраном через маппинг
        const tab = SCREEN_TO_TAB_MAP[screen]
        if (tab) {
          setActiveTab(tab)
        }
      } else {
        logger.log('Раздел в разработке:', destination)
      }
    },
    [setCurrentScreen, setActiveTab]
  )

  const back = useCallback(() => {
    setCurrentScreen(ROUTES.HOME)
    setActiveTab('home')
  }, [setCurrentScreen, setActiveTab])

  return { navigate, back }
}

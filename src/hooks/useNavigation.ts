/**
 * Хук для управления навигацией
 */

import { useCallback } from 'react'
import type { Screen, Tab } from '../types'
import { VALID_SCREENS } from '../constants/routes'

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

        // Синхронизация таба с экраном
        if (destination === 'settings') {
          setActiveTab('profile')
        } else if (destination === 'shifts') {
          setActiveTab('shifts')
        } else if (destination === 'vacancies') {
          setActiveTab('vacancies')
        } else if (destination === 'notifications') {
          setActiveTab('notifications')
        }
      } else {
        console.log('Раздел в разработке:', destination)
      }
    },
    [setCurrentScreen, setActiveTab]
  )

  const back = useCallback(() => {
    setCurrentScreen('home')
    setActiveTab('home')
  }, [setCurrentScreen, setActiveTab])

  return { navigate, back }
}

/**
 * Хук для работы с данными пользователя из Redux
 */

import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setUserData, clearUserData } from '../store/userSlice'
import type { UserData } from '../services/api/authApi'

export function useUser() {
  const dispatch = useAppDispatch()
  const userData = useAppSelector(state => state.user.userData)

  return {
    userData,
    setUserData: (data: UserData | null) => dispatch(setUserData(data)),
    clearUserData: () => dispatch(clearUserData()),
  }
}




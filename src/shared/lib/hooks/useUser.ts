/**
 * Хук для работы с данными пользователя из Redux
 */

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import type { UserData } from '@/services/api/authApi'
import { clearUserData, selectUserData, setUserData } from '@/shared/store/user'

export const useUser = () => {
  const dispatch = useAppDispatch()
  const userData = useAppSelector(selectUserData)

  return {
    userData,
    setUserData: (data: UserData | null) => dispatch(setUserData(data)),
    clearUserData: () => dispatch(clearUserData()),
  }
}

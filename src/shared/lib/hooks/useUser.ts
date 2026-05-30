/**
 * Хук для работы с данными пользователя из Redux
 */

import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { clearUserData, selectUserData, setUserData } from '@/features/navigation/model/userSlice'
import type { UserData } from '@/services/api/authApi'

export const useUser = () => {
  const dispatch = useAppDispatch()
  const userData = useAppSelector(selectUserData)

  return {
    userData,
    setUserData: (data: UserData | null) => dispatch(setUserData(data)),
    clearUserData: () => dispatch(clearUserData()),
  }
}

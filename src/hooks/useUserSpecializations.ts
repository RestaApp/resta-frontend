/**
 * Хук для работы со специализациями
 * Инкапсулирует логику работы со специализациями пользователей
 */

import { useAuth } from '../contexts/AuthContext'
import { useGetUserSpecializationsQuery } from '../services/api/usersApi'

interface UseUserSpecializationsOptions {
  /**
   * Позиция для получения специализаций
   */
  position: string | null
  /**
   * Загружать специализации только если включено
   */
  enabled?: boolean
}

/**
 * Хук для получения специализаций для позиции
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useUserSpecializations = (options: UseUserSpecializationsOptions) => {
  const { enabled = false, position } = options
  const { isAuthenticated } = useAuth()

  // Пропускаем запрос до получения токена, если не включен, или если нет позиции
  const { data, isLoading, isFetching, error, refetch } = useGetUserSpecializationsQuery(
    position || '',
    {
      skip: !enabled || !isAuthenticated || !position,
    }
  )

  const specializations = data?.data ?? []

  return {
    specializations,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

/**
 * Хук для работы с ролями
 * Инкапсулирует логику работы с ролями пользователей
 */

import { useGetAvailableUserRolesQuery } from '@/services/api/rolesApi'
import { useAuth } from '@/contexts/AuthContext'

interface UseRolesOptions {
  /**
   * Дополнительное условие для пропуска запроса
   * Например, если у пользователя уже есть роль, не нужно запрашивать роли
   */
  skip?: boolean
}

/**
 * Хук для получения доступных ролей пользователя
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useRoles = (options: UseRolesOptions = {}) => {
  const { isAuthenticated } = useAuth()
  const { skip: additionalSkip = false } = options

  // Пропускаем запрос до получения токена (sign_in должен выполниться первым)
  // Или если передан дополнительный флаг skip
  // Отключаем refetch при повторном монтировании (React StrictMode в DEV) — избежим двойного запроса
  const { data, isLoading, isFetching, error, refetch } = useGetAvailableUserRolesQuery(undefined, {
    skip: !isAuthenticated || additionalSkip,
    refetchOnMountOrArgChange: false,
  })

  return {
    roles: data?.data ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

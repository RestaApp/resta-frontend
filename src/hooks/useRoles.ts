/**
 * Хук для работы с ролями
 * Инкапсулирует логику работы с ролями пользователей
 */

import { useGetAvailableUserRolesQuery } from '../services/api/rolesApi'
import type { RoleApiItem } from '../services/api/rolesApi'

/**
 * Хук для получения доступных ролей пользователя
 */
export function useRoles() {
  const { data, isLoading, isFetching, error, refetch } = useGetAvailableUserRolesQuery()

  return {
    roles: (data?.data ?? []) as RoleApiItem[],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}



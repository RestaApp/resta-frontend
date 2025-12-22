/**
 * Хук для работы с типами поставщиков
 * Инкапсулирует логику работы с типами поставщиков
 */

import { useAuth } from '../contexts/AuthContext'
import { useGetSupplierTypesQuery } from '../services/api/rolesApi'

interface UseSupplierTypesOptions {
  /**
   * Загружать типы поставщиков только если включено
   */
  enabled?: boolean
}

/**
 * Хук для получения типов поставщиков
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export function useSupplierTypes(options: UseSupplierTypesOptions = {}) {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()

  // Пропускаем запрос до получения токена или если не включен
  const { data, isLoading, isFetching, error, refetch } = useGetSupplierTypesQuery(undefined, {
    skip: !enabled || !isAuthenticated,
  })

  const supplierTypes = data?.data ?? []

  return {
    supplierTypes,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

/**
 * Категории поставщика: GET /api/v1/catalogs/supplier_categories (API.md)
 */

import { useGetSupplierCategoriesQuery } from '@/services/api/rolesApi'
import { useAuth } from '@/contexts/auth'

interface UseSupplierCategoriesOptions {
  enabled?: boolean
}

export const useSupplierCategories = (options: UseSupplierCategoriesOptions = {}) => {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()

  const { data, isLoading, isFetching, error, refetch } = useGetSupplierCategoriesQuery(undefined, {
    skip: !enabled || !isAuthenticated,
    refetchOnMountOrArgChange: false,
  })

  return {
    supplierCategories: data?.data ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

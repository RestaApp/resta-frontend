/**
 * Хук для логики выбора основной роли
 */

import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useRoles } from './hooks/useRoles'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useSupplierCategories } from './hooks/useSupplierCategories'
import { useSupplierTypes } from './hooks/useSupplierTypes'
import { useRestaurantFormats } from './hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '../utils/mappers'
import { isVerifiedRole, mapRoleFromApi } from '@/utils/roles'
import type { UiRole } from '@/shared/types/roles.types'

interface UseRoleSelectionProps {
  onSelectRole: (role: UiRole) => void
}

export const useRoleSelection = ({ onSelectRole }: UseRoleSelectionProps) => {
  const [draftSelectedRole, setDraftSelectedRole] = useState<UiRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  /** Шаг 1 поставщика: категория (GET /catalogs/supplier_categories) */
  const [showSupplierCategory, setShowSupplierCategory] = useState(false)
  /** Выбранная категория — для GET /catalogs/supplier_types?supplier_category= */
  const [selectedSupplierCategory, setSelectedSupplierCategory] = useState<string | null>(null)
  /** Шаг 2 поставщика: типы и форма */
  const [showSupplierTypes, setShowSupplierTypes] = useState(false)
  const [showRestaurantFormats, setShowRestaurantFormats] = useState(false)

  const userData = useAppSelector(selectUserData)
  const isUnverified = useMemo(() => {
    const apiRole = mapRoleFromApi(userData?.role)
    return !isVerifiedRole(apiRole)
  }, [userData?.role])

  const { roles, isLoading, isFetching, error } = useRoles({ skip: !isUnverified })

  const shouldLoadPositions = (draftSelectedRole === 'chef' || showEmployeeSubRoles) && isUnverified

  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  const shouldLoadSupplierCategories = showSupplierCategory && isUnverified

  const {
    supplierCategories,
    isLoading: isLoadingSupplierCategories,
    isFetching: isFetchingSupplierCategories,
  } = useSupplierCategories({ enabled: shouldLoadSupplierCategories })

  const shouldLoadSupplierTypes =
    showSupplierTypes && isUnverified && selectedSupplierCategory !== null

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({
    enabled: shouldLoadSupplierTypes,
    supplierCategory: selectedSupplierCategory ?? 'products',
  })

  const shouldLoadRestaurantFormats =
    (draftSelectedRole === 'venue' || showRestaurantFormats) && isUnverified

  const {
    restaurantFormats,
    isLoading: isLoadingRestaurantFormats,
    isFetching: isFetchingRestaurantFormats,
  } = useRestaurantFormats({ enabled: shouldLoadRestaurantFormats })

  const mainRoles = useMemo(() => {
    if (roles.length === 0) {
      return []
    }
    return mapRoleOptionsFromApi(roles)
  }, [roles])

  const handleSupplierCategoryContinue = useCallback((category: string) => {
    setSelectedSupplierCategory(category)
    setShowSupplierCategory(false)
    setShowSupplierTypes(true)
  }, [])

  const handleRoleSelect = useCallback(
    (roleId: UiRole) => {
      setDraftSelectedRole(roleId)

      if (roleId === 'chef') {
        setShowEmployeeSubRoles(true)
        return
      }

      if (roleId === 'supplier') {
        setShowSupplierCategory(true)
        return
      }

      if (roleId === 'venue') {
        setShowRestaurantFormats(true)
        return
      }

      onSelectRole(roleId)
    },
    [onSelectRole]
  )

  const handleBack = useCallback(() => {
    setDraftSelectedRole(null)

    if (showEmployeeSubRoles) {
      setShowEmployeeSubRoles(false)
    } else if (showSupplierTypes) {
      setShowSupplierTypes(false)
      setShowSupplierCategory(true)
    } else if (showSupplierCategory) {
      setShowSupplierCategory(false)
      setSelectedSupplierCategory(null)
    } else if (showRestaurantFormats) {
      setShowRestaurantFormats(false)
    }
  }, [showEmployeeSubRoles, showSupplierTypes, showSupplierCategory, showRestaurantFormats])

  return {
    selectedRole: draftSelectedRole,
    showEmployeeSubRoles,
    showSupplierCategory,
    showSupplierTypes,
    showRestaurantFormats,
    mainRoles,
    isLoading,
    isFetching,
    error,
    employeeSubRoles,
    isLoadingPositions,
    isFetchingPositions,
    supplierCategories,
    isLoadingSupplierCategories,
    isFetchingSupplierCategories,
    selectedSupplierCategory,
    handleSupplierCategoryContinue,
    supplierTypes,
    isLoadingSupplierTypes,
    isFetchingSupplierTypes,
    restaurantFormats,
    isLoadingRestaurantFormats,
    isFetchingRestaurantFormats,
    handleRoleSelect,
    handleBack,
    setShowEmployeeSubRoles,
    setShowSupplierTypes,
    setShowRestaurantFormats,
  }
}

/**
 * Хук для логики выбора основной роли
 */

import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { useRoles } from './hooks/useRoles'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useSupplierCategories } from './hooks/useSupplierCategories'
import { useRestaurantFormats } from './hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '@/shared/utils/roleMappers'
import { isEmployeeRole, isVerifiedRole, mapRoleFromApi } from '@/shared/utils/roles'
import type { UiRole } from '@/shared/types/roles.types'

interface UseRoleSelectionProps {
  onSelectRole: (role: UiRole) => void
}

export const useRoleSelection = ({ onSelectRole }: UseRoleSelectionProps) => {
  const [draftSelectedRole, setDraftSelectedRole] = useState<UiRole | null>(null)
  const [showTelegramConfirm, setShowTelegramConfirm] = useState(false)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [showSupplierCategory, setShowSupplierCategory] = useState(false)
  const [showRestaurantFormats, setShowRestaurantFormats] = useState(false)

  const userData = useAppSelector(selectUserData)
  const isUnverified = useMemo(() => {
    const apiRole = mapRoleFromApi(userData?.role)
    return !isVerifiedRole(apiRole)
  }, [userData?.role])

  const { roles, isLoading, isFetching, error } = useRoles({ skip: !isUnverified })

  const shouldLoadPositions = showEmployeeSubRoles && isUnverified

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

  const shouldLoadRestaurantFormats = showRestaurantFormats && isUnverified

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

  const handleRoleSelect = useCallback((roleId: UiRole) => {
    setDraftSelectedRole(roleId)
  }, [])

  const handleRoleContinue = useCallback(() => {
    if (!draftSelectedRole) return
    setShowTelegramConfirm(true)
  }, [draftSelectedRole])

  const handleTelegramContinue = useCallback(() => {
    if (!draftSelectedRole) return

    setShowTelegramConfirm(false)

    if (isEmployeeRole(draftSelectedRole)) {
      setShowEmployeeSubRoles(true)
      return
    }

    if (draftSelectedRole === 'supplier') {
      setShowSupplierCategory(true)
      return
    }

    if (draftSelectedRole === 'venue') {
      setShowRestaurantFormats(true)
      return
    }

    onSelectRole(draftSelectedRole)
  }, [draftSelectedRole, onSelectRole])

  const handleBack = useCallback(() => {
    if (showEmployeeSubRoles) {
      setShowEmployeeSubRoles(false)
      setShowTelegramConfirm(true)
      return
    }

    if (showSupplierCategory) {
      setShowSupplierCategory(false)
      setShowTelegramConfirm(true)
      return
    }

    if (showRestaurantFormats) {
      setShowRestaurantFormats(false)
      setShowTelegramConfirm(true)
      return
    }

    if (showTelegramConfirm) {
      setShowTelegramConfirm(false)
      return
    }

    if (draftSelectedRole) {
      setDraftSelectedRole(null)
    }
  }, [
    draftSelectedRole,
    showEmployeeSubRoles,
    showSupplierCategory,
    showRestaurantFormats,
    showTelegramConfirm,
  ])

  return {
    selectedRole: draftSelectedRole,
    showTelegramConfirm,
    showEmployeeSubRoles,
    showSupplierCategory,
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
    restaurantFormats,
    isLoadingRestaurantFormats,
    isFetchingRestaurantFormats,
    handleRoleSelect,
    handleRoleContinue,
    handleTelegramContinue,
    handleBack,
  }
}

/**
 * Хук для логики выбора основной роли
 */

import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useRoles } from '@/hooks/useRoles'
import { useUserPositions } from '@/hooks/useUserPositions'
import { useSupplierTypes } from '@/hooks/useSupplierTypes'
import { useRestaurantFormats } from '@/hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '@/utils/rolesMapper'
import { isVerifiedRole } from '@/utils/roles'
import { useUserUpdate } from './useUserUpdate'
import type { UserRole } from '@/types'

interface UseRoleSelectionProps {
  onSelectRole: (role: UserRole) => void
}

export const useRoleSelection = ({ onSelectRole }: UseRoleSelectionProps) => {
  const [draftSelectedRole, setDraftSelectedRole] = useState<UserRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [showSupplierTypes, setShowSupplierTypes] = useState(false)
  const [showRestaurantFormats, setShowRestaurantFormats] = useState(false)

  const userData = useAppSelector(state => state.user.userData)
  const { updateUserRole } = useUserUpdate()

  // Проверяем, что роль пользователя равна 'unverified'
  const isUnverifiedRole = useMemo(() => {
    return !isVerifiedRole(userData?.role)
  }, [userData?.role])

  // Запрашиваем роли только если пользователь авторизован И его роль равна 'unverified'
  const { roles, isLoading, isFetching, error } = useRoles({ skip: !isUnverifiedRole })

  // Загружаем позиции только если выбрана роль employee (chef) И роль пользователя unverified
  const shouldLoadPositions =
    (draftSelectedRole === 'chef' || showEmployeeSubRoles) && isUnverifiedRole

  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  // Загружаем типы поставщиков только если выбрана роль supplier И роль пользователя unverified
  const shouldLoadSupplierTypes =
    (draftSelectedRole === 'supplier' || showSupplierTypes) && isUnverifiedRole

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({ enabled: shouldLoadSupplierTypes })

  // Загружаем форматы ресторанов только если выбрана роль venue И роль пользователя unverified
  const shouldLoadRestaurantFormats =
    (draftSelectedRole === 'venue' || showRestaurantFormats) && isUnverifiedRole

  const {
    restaurantFormats,
    isLoading: isLoadingRestaurantFormats,
    isFetching: isFetchingRestaurantFormats,
  } = useRestaurantFormats({ enabled: shouldLoadRestaurantFormats })

  // Преобразуем данные из API в формат компонентов
  const mainRoles = useMemo(() => {
    if (roles.length === 0) {
      return []
    }
    return mapRoleOptionsFromApi(roles)
  }, [roles])

  const handleRoleSelect = useCallback(
    async (roleId: UserRole) => {
      setDraftSelectedRole(roleId)

      // Если выбрали сотрудника, показываем экран подролей
      if (roleId === 'chef') {
        setShowEmployeeSubRoles(true)
        return
      }

      // Если выбрали поставщика, показываем экран типов поставщиков
      if (roleId === 'supplier') {
        setShowSupplierTypes(true)
        return
      }

      // Если выбрали заведение, показываем экран форматов ресторанов
      if (roleId === 'venue') {
        setShowRestaurantFormats(true)
        return
      }

      // Для остальных ролей отправляем на сервер
      await updateUserRole(roleId, onSelectRole)
    },
    [onSelectRole, updateUserRole]
  )

  const handleBack = useCallback(() => {
    if (showEmployeeSubRoles) {
      setShowEmployeeSubRoles(false)
    } else if (showSupplierTypes) {
      setShowSupplierTypes(false)
    } else if (showRestaurantFormats) {
      setShowRestaurantFormats(false)
    }
  }, [showEmployeeSubRoles, showSupplierTypes, showRestaurantFormats])

  return {
    selectedRole: draftSelectedRole,
    showEmployeeSubRoles,
    showSupplierTypes,
    showRestaurantFormats,
    mainRoles,
    isLoading,
    isFetching,
    error,
    employeeSubRoles,
    isLoadingPositions,
    isFetchingPositions,
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


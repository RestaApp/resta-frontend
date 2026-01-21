/**
 * Хук для логики выбора основной роли
 */

import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/telegram/model/userSlice'
import { useRoles } from '@/hooks/useRoles'
import { useUserPositions } from '@/hooks/useUserPositions'
import { useSupplierTypes } from '@/hooks/useSupplierTypes'
import { useRestaurantFormats } from '@/hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '@/utils/rolesMapper'
import { isVerifiedRole, mapRoleFromApi } from '@/utils/roles'
import { useUserUpdate } from './useUserUpdate'
import type { UiRole } from '@/types'

interface UseRoleSelectionProps {
  onSelectRole: (role: UiRole) => void
}

export const useRoleSelection = ({ onSelectRole }: UseRoleSelectionProps) => {
  const [draftSelectedRole, setDraftSelectedRole] = useState<UiRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [showSupplierTypes, setShowSupplierTypes] = useState(false)
  const [showRestaurantFormats, setShowRestaurantFormats] = useState(false)

  const userData = useAppSelector(selectUserData)
  const { updateUiRole } = useUserUpdate()

  // Проверяем, что роль пользователя равна 'unverified'
  const isUnverified = useMemo(() => {
    const apiRole = mapRoleFromApi(userData?.role)
    return !isVerifiedRole(apiRole)
  }, [userData?.role])

  // Запрашиваем роли только если пользователь авторизован И его роль равна 'unverified'
  const { roles, isLoading, isFetching, error } = useRoles({ skip: !isUnverified })

  // Загружаем позиции только если выбрана роль employee (chef) И роль пользователя unverified
  const shouldLoadPositions =
    (draftSelectedRole === 'chef' || showEmployeeSubRoles) && isUnverified

  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  // Загружаем типы поставщиков только если выбрана роль supplier И роль пользователя unverified
  const shouldLoadSupplierTypes =
    (draftSelectedRole === 'supplier' || showSupplierTypes) && isUnverified

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({ enabled: shouldLoadSupplierTypes })

  // Загружаем форматы ресторанов только если выбрана роль venue И роль пользователя unverified
  const shouldLoadRestaurantFormats =
    (draftSelectedRole === 'venue' || showRestaurantFormats) && isUnverified

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
    async (roleId: UiRole) => {
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
      await updateUiRole(roleId, onSelectRole)
    },
    [onSelectRole, updateUiRole]
  )

  const handleBack = useCallback(() => {
    // Сбрасываем выбранную роль при возврате
    setDraftSelectedRole(null)
    
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

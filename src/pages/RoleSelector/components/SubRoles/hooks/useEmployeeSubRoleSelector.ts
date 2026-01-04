/**
 * Хук для бизнес-логики выбора подроли сотрудника
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useUserSpecializations } from '@/hooks/useUserSpecializations'
import { useGeolocation } from '@/hooks/useGeolocation'
import { getDrawerTitle } from '@/constants/drawerTitles'
import { isPromise } from '@/utils/promise'
import type { EmployeeRole } from '@/types'
import { mapEmployeeSubRolesFromApi } from '@/utils/rolesMapper'
import { setupTelegramBackButton } from '@/utils/telegram'

export interface EmployeeFormData {
  specializations: string[]
  experienceYears: number
  location: string
  openToWork: boolean
}

interface UseEmployeeSubRoleSelectorProps {
  employeeSubRoles?: string[]
  selectedSubRole: EmployeeRole | null
  onSelectSubRole: (role: EmployeeRole, positionValue: string) => void
  onBack: () => void
  onContinue?: (formData: EmployeeFormData) => Promise<boolean> | void
}

export const useEmployeeSubRoleSelector = ({
  employeeSubRoles,
  onSelectSubRole,
  onBack,
  onContinue,
}: UseEmployeeSubRoleSelectorProps) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    specializations: [],
    experienceYears: 0,
    location: '',
    openToWork: false,
  })
  const [showSpecializationDrawer, setShowSpecializationDrawer] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [selectedPositionValueLocal, setSelectedPositionValueLocal] = useState<string | null>(null)

  // Хук для геолокации
  const { getLocation, isLoading: isLoadingLocation } = useGeolocation()

  // Преобразуем данные из API в формат компонентов
  const subRoles = useMemo(() => {
    if (employeeSubRoles && employeeSubRoles.length > 0) {
      return mapEmployeeSubRolesFromApi(employeeSubRoles)
    }
    return []
  }, [employeeSubRoles])

  // Специализации для drawer (выбор сразу после позиции)
  const { specializations: drawerSpecializations = [], isLoading: isLoadingDrawerSpecs } =
    useUserSpecializations({
      position: selectedPositionValueLocal || '',
      enabled: showSpecializationDrawer && !!selectedPositionValueLocal,
    })

  // Получаем заголовок для drawer на основе позиции
  const drawerTitle = useMemo(() => {
    return getDrawerTitle(selectedPositionValueLocal, drawerSpecializations.length > 0)
  }, [selectedPositionValueLocal, drawerSpecializations.length])

  useEffect(() => {
    const cleanup = setupTelegramBackButton(() => {
      onBack()
    })
    return cleanup
  }, [onBack])

  const handlePositionSelect = useCallback(
    (role: EmployeeRole, positionValue: string) => {
      onSelectSubRole(role, positionValue)
      setSelectedPositionValueLocal(positionValue)
      setSelectedSpecializations([])
      setShowSpecializationDrawer(true)
    },
    [onSelectSubRole]
  )

  const handleSpecializationToggle = useCallback((spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }, [])

  const handleLocationRequest = useCallback(async () => {
    const city = await getLocation()
    if (city) {
      setFormData(prev => ({
        ...prev,
        location: city,
      }))
    }
  }, [getLocation])

  const handleSpecializationDone = useCallback(async () => {
    // Создаем финальный formData с актуальными данными
    const finalFormData: EmployeeFormData = {
      ...formData,
      specializations: selectedSpecializations,
    }

    // Обновляем состояние
    setFormData(finalFormData)

    // Вызываем callback с финальными данными для сохранения
    // НЕ закрываем drawer сразу - ждем результата
    if (!onContinue) {
      setShowSpecializationDrawer(false)
      return
    }

    try {
      const result = onContinue(finalFormData)

      if (isPromise<boolean | void>(result)) {
        // Ждем результат промиса
        const promiseResult = await result
        // Закрываем drawer ТОЛЬКО если результат true (успех)
        if (promiseResult === true) {
          setShowSpecializationDrawer(false)
        }
        // Если result === false или undefined, drawer остается открытым
      } else {
        // Если результат не промис (старый формат или void), считаем успехом и закрываем drawer
        setShowSpecializationDrawer(false)
      }
    } catch (error) {
      // При ошибке drawer остается открытым
      console.error('Ошибка при сохранении:', error)
    }
  }, [selectedSpecializations, onContinue, formData])

  const updateFormData = useCallback((updates: Partial<EmployeeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    subRoles,
    formData,
    showSpecializationDrawer,
    selectedSpecializations,
    drawerSpecializations,
    isLoadingDrawerSpecs,
    drawerTitle,
    isLoadingLocation,
    handlePositionSelect,
    handleSpecializationToggle,
    handleLocationRequest,
    handleSpecializationDone,
    updateFormData,
    setShowSpecializationDrawer,
  }
}

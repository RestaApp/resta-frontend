/**
 * Хук для бизнес-логики выбора подроли сотрудника
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { setupTelegramBackButton } from '../../../../../utils/telegram'
import { useUserSpecializations } from '../../../../../hooks/useUserSpecializations'
import { useGeolocation } from '../../../../../hooks/useGeolocation'
import { getDrawerTitle } from '../../../../../constants/drawerTitles'
import type { EmployeeRole } from '../../../../../types'
import { mapEmployeeSubRolesFromApi } from '../../../../../utils/rolesMapper'

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

export function useEmployeeSubRoleSelector({
  employeeSubRoles,
  selectedSubRole,
  onSelectSubRole,
  onBack,
  onContinue,
}: UseEmployeeSubRoleSelectorProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    specializations: [],
    experienceYears: 0,
    location: '',
    openToWork: false,
  })
  const [showSpecializationDrawer, setShowSpecializationDrawer] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [selectedPositionValueLocal, setSelectedPositionValueLocal] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  // Хук для геолокации
  const { getLocation, isLoading: isLoadingLocation } = useGeolocation()

  // Преобразуем данные из API в формат компонентов
  const subRoles = useMemo(() => {
    if (employeeSubRoles && employeeSubRoles.length > 0) {
      return mapEmployeeSubRolesFromApi(employeeSubRoles)
    }
    return []
  }, [employeeSubRoles])

  // Получаем positionValue из selectedSubRole через маппинг
  const positionValue = useMemo(() => {
    if (!selectedSubRole) return null
    const subRole = subRoles.find(r => r.id === selectedSubRole)
    return subRole?.originalValue || null
  }, [selectedSubRole, subRoles])

  // Загружаем специализации для выбранной позиции
  const { specializations: availableSpecializations, isLoading: isLoadingSpecs } =
    useUserSpecializations({
      position: positionValue,
      enabled: showForm && !!positionValue,
    })

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
      if (showForm) {
        setShowForm(false)
      } else {
        onBack()
      }
    })
    return cleanup
  }, [onBack, showForm])

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
    // Защита от двойного вызова
    if (isSubmittingRef.current) {
      return
    }

    isSubmittingRef.current = true

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
      isSubmittingRef.current = false
      return
    }

    try {
      const result = onContinue(finalFormData)

      // Проверяем, является ли результат промисом
      const isPromise =
        result !== undefined &&
        result !== null &&
        typeof result === 'object' &&
        'then' in result &&
        typeof (result as Promise<unknown>).then === 'function'

      if (isPromise) {
        // Ждем результат промиса
        const promiseResult = await (result as Promise<boolean | void>)
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
    } finally {
      isSubmittingRef.current = false
    }
  }, [selectedSpecializations, onContinue, formData])

  const updateFormData = useCallback((updates: Partial<EmployeeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    subRoles,
    showForm,
    formData,
    showSpecializationDrawer,
    selectedSpecializations,
    availableSpecializations,
    isLoadingSpecs,
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

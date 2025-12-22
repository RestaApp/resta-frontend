/**
 * Хук для бизнес-логики выбора подроли сотрудника
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { setupTelegramBackButton } from '../../../../../utils/telegram'
import { useUserSpecializations } from '../../../../../hooks/useUserSpecializations'
import { getEmployeePositionLabel } from '../../../../../constants/labels'
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
}

export function useEmployeeSubRoleSelector({
  employeeSubRoles,
  selectedSubRole,
  onSelectSubRole,
  onBack,
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
    if (!selectedPositionValueLocal) return 'Выберите специализации'
    const positionLabel = getEmployeePositionLabel(selectedPositionValueLocal)
    if (selectedPositionValueLocal === 'chef') return 'Какой вы повар?'
    if (selectedPositionValueLocal === 'waiter') return 'Ваша специализация официанта?'
    if (selectedPositionValueLocal === 'bartender') return 'Ваш уровень в барменстве?'
    if (selectedPositionValueLocal === 'barista') return 'Ваш уровень бариста?'
    return `Ваша специализация ${positionLabel.toLowerCase()}?`
  }, [selectedPositionValueLocal])

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

  const handleLocationRequest = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setFormData(prev => ({
            ...prev,
            location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          }))
        },
        () => {
          // Ошибка получения геолокации - пользователь может ввести вручную
        }
      )
    }
  }, [])

  const handleSpecializationDone = useCallback(() => {
    setFormData(prev => ({ ...prev, specializations: selectedSpecializations }))
    setShowSpecializationDrawer(false)
    setShowForm(true)
  }, [selectedSpecializations])

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
    handlePositionSelect,
    handleSpecializationToggle,
    handleLocationRequest,
    handleSpecializationDone,
    updateFormData,
    setShowSpecializationDrawer,
  }
}

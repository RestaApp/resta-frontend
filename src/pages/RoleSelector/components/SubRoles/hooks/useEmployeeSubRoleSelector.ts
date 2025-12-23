/**
 * Хук для бизнес-логики выбора подроли сотрудника
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { setupTelegramBackButton } from '../../../../../utils/telegram'
import { useUserSpecializations } from '../../../../../hooks/useUserSpecializations'
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
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const isSubmittingRef = useRef(false)

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
    if (!selectedPositionValueLocal) return 'Настройка профиля'
    // Если есть специализации, показываем вопрос про специализацию
    if (drawerSpecializations.length > 0) {
      if (selectedPositionValueLocal === 'chef') return 'Какой вы повар?'
      if (selectedPositionValueLocal === 'waiter') return 'Ваша специализация?'
      if (selectedPositionValueLocal === 'bartender') return 'Ваш уровень в барменстве?'
      if (selectedPositionValueLocal === 'barista') return 'Ваш уровень бариста?'
      return 'Ваша специализация?'
    }
    // Если специализаций нет, показываем общий заголовок
    return 'Настройка профиля'
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
    if (!navigator.geolocation) {
      console.warn('Geolocation не поддерживается')
      return
    }

    // Защита от повторных запросов
    if (isLoadingLocation) {
      return
    }

    setIsLoadingLocation(true)

    try {
      // Получаем координаты
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error: GeolocationPositionError) => {
            // Пользователь отклонил доступ или произошла ошибка геолокации
            // Не логируем, просто отклоняем промис
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        )
      })

      const { latitude, longitude } = position.coords
      console.log('Получены координаты:', latitude, longitude)

      // Используем Nominatim API для получения города по координатам
      // Добавляем задержку для соблюдения rate limit
      await new Promise(resolve => setTimeout(resolve, 1000))

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=ru`

      let response: Response
      try {
        // Убираем User-Agent заголовок - браузер не позволяет его устанавливать
        response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })
      } catch (fetchError) {
        // Ошибка сети или CORS
        console.warn('Не удалось получить город из API (возможно, проблема с CORS):', fetchError)
        return
      }

      if (!response.ok) {
        console.warn(`Ошибка API: status ${response.status}`)
        return
      }

      const data = await response.json()
      console.log('Ответ Nominatim API:', data)

      if (!data || !data.address) {
        console.warn('Неверный формат ответа API:', data)
        return
      }

      // Пробуем разные варианты получения города
      const address = data.address
      let city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.city_district ||
        address.county ||
        address.state

      // Если не нашли город в address, пробуем из display_name
      if (!city && data.display_name) {
        const parts = data.display_name.split(',')
        // Обычно город - это один из первых элементов
        city =
          parts
            .find(
              (part: string) =>
                part.trim().length > 0 &&
                !part.includes('область') &&
                !part.includes('район') &&
                !part.includes('улица')
            )
            ?.trim() || parts[0]?.trim()
      }

      if (!city) {
        console.warn('Не удалось извлечь город из ответа API')
        return
      }

      console.log('Извлеченный город:', city)

      setFormData(prev => ({
        ...prev,
        location: city,
      }))
    } catch (error) {
      // Проверяем, является ли это ошибкой геолокации
      const isGeolocationError =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 1 || error.code === 2 || error.code === 3)

      if (isGeolocationError) {
        // Это ошибка геолокации (пользователь отклонил или недоступно)
        // Не логируем, просто игнорируем
        return
      }

      // Логируем только неожиданные ошибки
      console.warn('Ошибка определения местоположения:', error)
    } finally {
      setIsLoadingLocation(false)
    }
  }, [isLoadingLocation])

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
    if (onContinue) {
      try {
        const result = onContinue(finalFormData)

        // Если результат - промис, ждем его перед принятием решения о закрытии drawer
        const isPromise =
          result &&
          typeof result === 'object' &&
          typeof (result as Promise<unknown>).then === 'function'

        if (isPromise) {
          // Ждем результат промиса
          const promiseResult = await (result as Promise<boolean | void>)
          // Закрываем drawer ТОЛЬКО если результат true (успех)
          // Если result === false или undefined, drawer остается открытым
          if (promiseResult === true) {
            setShowSpecializationDrawer(false)
          }
          // Если result === false, значит была ошибка - drawer остается открытым
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
    } else {
      // Если нет callback, просто закрываем drawer
      setShowSpecializationDrawer(false)
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

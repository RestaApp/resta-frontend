/**
 * Хук для работы с экстрасменами (заменами)
 * Инкапсулирует логику работы с заменами из API
 */

import { useAuth } from '@/contexts/AuthContext'
import { useGetVacanciesQuery, type GetVacanciesParams } from '@/services/api/shiftsApi'
import { useMemo } from 'react'
import i18n from '@/shared/i18n/config'
import { parseApiDateTime } from '../utils/formatting'

interface UseReplacementShiftsOptions {
  /**
   * Категория (роль): chef, waiter, bartender, barista, manager, support
   */
  category?: string
  /**
   * Местоположение
   */
  location?: string
  /**
   * Минимальная оплата
   */
  minPayment?: number
  /**
   * Максимальная оплата
   */
  maxPayment?: number
  /**
   * Дата начала (YYYY-MM-DD)
   */
  startDate?: string
  /**
   * Номер страницы
   */
  page?: number
  /**
   * Количество на странице
   */
  perPage?: number
  /**
   * Пропустить запрос
   */
  skip?: boolean
}

/**
 * Хук для получения экстрасмен (замен)
 * Запрос выполняется только после успешной авторизации (получения токена)
 * По умолчанию возвращает только срочные смены (urgent: true)
 */
export const useReplacementShifts = (options: UseReplacementShiftsOptions = {}) => {
  const {
    category,
    location,
    minPayment,
    maxPayment,
    startDate,
    page = 1,
    perPage = 20,
    skip = false,
  } = options
  const { isAuthenticated } = useAuth()

  // Преобразуем категорию в target_roles
  const targetRoles = useMemo(() => {
    if (!category || category === 'all') {
      return undefined
    }
    return [category]
  }, [category])

  // Формируем параметры запроса
  // Всегда запрашиваем только срочные смены (urgent: true)
  const params: GetVacanciesParams = useMemo(
    () => ({
      shift_type: 'replacement',
      urgent: true, // Всегда только срочные
      ...(location && { location }),
      ...(minPayment !== undefined && { min_payment: minPayment }),
      ...(maxPayment !== undefined && { max_payment: maxPayment }),
      ...(startDate && { start_date: startDate }),
      ...(targetRoles && { target_roles: targetRoles }),
      page,
      per_page: perPage,
    }),
    [location, minPayment, maxPayment, startDate, targetRoles, page, perPage]
  )

  const { data, isLoading, isFetching, error, refetch } = useGetVacanciesQuery(params, {
    skip: !isAuthenticated || skip,
    refetchOnMountOrArgChange: true,
  })

  // Преобразуем данные из API в формат компонента
  const shifts = useMemo(() => {
    if (!data?.data) {
      return []
    }

    return data.data.map(vacancy => {
      // Форматируем оплату
      let pay = 0
      if (vacancy.payment) {
        const paymentValue =
          typeof vacancy.payment === 'string' ? parseFloat(vacancy.payment) : vacancy.payment
        if (!isNaN(paymentValue)) {
          pay = paymentValue
        }
      } else if (vacancy.hourly_rate) {
        const hourlyValue =
          typeof vacancy.hourly_rate === 'string'
            ? parseFloat(vacancy.hourly_rate)
            : vacancy.hourly_rate
        if (!isNaN(hourlyValue)) {
          // Если есть только hourly_rate, используем его как базовую оплату
          pay = hourlyValue
        }
      }

      // Форматируем дату и время
      let date = i18n.t('feedFallback.notSpecified')
      let time = i18n.t('feedFallback.notSpecified')
      if (vacancy.start_time && vacancy.end_time) {
        try {
          const startDate = parseApiDateTime(vacancy.start_time ?? undefined)
          const endDate = parseApiDateTime(vacancy.end_time ?? undefined)
          if (!startDate || !endDate) {
            throw new Error('Invalid date')
          }

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const shiftDate = new Date(startDate)
          shiftDate.setHours(0, 0, 0, 0)
          const isToday = shiftDate.getTime() === today.getTime()

          if (isToday) {
            date = i18n.t('common.today')
          } else {
            // Форматируем дату в локальном времени
            date = startDate.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })
          }

          // Форматируем время в локальном времени (toLocaleTimeString автоматически использует локальный часовой пояс)
          const startTime = startDate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const endTime = endDate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
          time = `${startTime} - ${endTime}`
        } catch (error) {
          // Если не удалось распарсить дату, используем исходные значения
          time = `${vacancy.start_time} - ${vacancy.end_time}`
        }
      }

      // Определяем роль из target_roles (используем значение как есть для маппинга)
      const role =
        vacancy.target_roles && vacancy.target_roles.length > 0 ? vacancy.target_roles[0] : 'chef'

      // Получаем название заведения из user
      const restaurant = vacancy.user?.name || vacancy.user?.full_name || i18n.t('feedFallback.notSpecified')

      // Получаем местоположение
      const shiftLocation = vacancy.location || vacancy.user?.location || i18n.t('feedFallback.notSpecified')

      return {
        id: String(vacancy.id),
        restaurant,
        role,
        date,
        time,
        pay,
        location: shiftLocation,
        urgent: vacancy.urgent || false,
        canApply: vacancy.can_apply,
        title: vacancy.title,
        description: vacancy.description,
        requirements: vacancy.requirements,
        applicationsCount: vacancy.applications_count,
      }
    })
  }, [data, i18n.language])

  return {
    shifts,
    isLoading,
    isFetching,
    error,
    refetch,
    meta: data?.meta,
  }
}

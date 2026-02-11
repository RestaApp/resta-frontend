/**
 * Хук для работы с вакансиями
 * Инкапсулирует логику работы с вакансиями из API
 */

import { useAuth } from '@/contexts/auth'
import { useGetVacanciesQuery, type GetVacanciesParams } from '@/services/api/shiftsApi'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { parseApiDateTime } from '../utils/formatting'

interface UseVacanciesOptions {
  /**
   * Категория (роль): chef, waiter, bartender, barista, manager, support
   */
  category?: string
  /**
   * Тип занятости: permanent, one-time
   */
  type?: string
  /**
   * Только срочные
   */
  urgentOnly?: boolean
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
 * Хук для получения вакансий
 * Запрос выполняется только после успешной авторизации (получения токена)
 */
export const useVacancies = (options: UseVacanciesOptions = {}) => {
  const {
    category,
    type,
    urgentOnly,
    location,
    minPayment,
    maxPayment,
    startDate,
    page = 1,
    perPage = 20,
    skip = false,
  } = options
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  // Преобразуем категорию в target_roles
  const targetRoles = useMemo(() => {
    if (!category || category === 'all') {
      return undefined
    }
    return [category]
  }, [category])

  // Формируем параметры запроса
  const params: GetVacanciesParams = useMemo(
    () => ({
      shift_type: 'vacancy',
      ...(urgentOnly && { urgent: true }),
      ...(location && { location }),
      ...(minPayment !== undefined && { min_payment: minPayment }),
      ...(maxPayment !== undefined && { max_payment: maxPayment }),
      ...(startDate && { start_date: startDate }),
      ...(targetRoles && { target_roles: targetRoles }),
      page,
      per_page: perPage,
    }),
    [urgentOnly, location, minPayment, maxPayment, startDate, targetRoles, page, perPage]
  )

  const { data, isLoading, isFetching, error, refetch } = useGetVacanciesQuery(params, {
    skip: !isAuthenticated || skip,
    refetchOnMountOrArgChange: true,
  })

  // Преобразуем данные из API в формат компонента
  const vacancies = useMemo(() => {
    if (!data?.data) {
      return []
    }

    return data.data
      .map(vacancy => {
        // Определяем тип занятости на основе shift_type
        // replacement обычно одноразовая, vacancy может быть постоянной
        let vacancyType = t('feedFallback.permanent')
        if (vacancy.shift_type === 'replacement' || vacancy.start_time) {
          vacancyType = t('feedFallback.oneTime')
        }

        // Форматируем оплату
        let salary = t('feedFallback.notSpecified')
        if (vacancy.payment) {
          const paymentValue =
            typeof vacancy.payment === 'string' ? parseFloat(vacancy.payment) : vacancy.payment
          if (!isNaN(paymentValue)) {
            salary = `${paymentValue} BYN`
            // Если есть hourly_rate, показываем оба варианта
            if (vacancy.hourly_rate) {
              const hourlyValue =
                typeof vacancy.hourly_rate === 'string'
                  ? parseFloat(vacancy.hourly_rate)
                  : vacancy.hourly_rate
              if (!isNaN(hourlyValue)) {
                salary = `${paymentValue} BYN (${hourlyValue} BYN/час)`
              }
            }
          }
        } else if (vacancy.hourly_rate) {
          const hourlyValue =
            typeof vacancy.hourly_rate === 'string'
              ? parseFloat(vacancy.hourly_rate)
              : vacancy.hourly_rate
          if (!isNaN(hourlyValue)) {
            salary = t('feedFallback.fromRate', { value: hourlyValue })
          }
        }

        // Форматируем график из start_time и end_time
        let schedule = t('feedFallback.notSpecified')
        if (vacancy.start_time && vacancy.end_time) {
          try {
            const startDate = parseApiDateTime(vacancy.start_time ?? undefined)
            const endDate = parseApiDateTime(vacancy.end_time ?? undefined)

            if (!startDate || !endDate) {
              throw new Error('Invalid date')
            }

            // Проверяем, один ли это день
            const isSameDay = startDate.toDateString() === endDate.toDateString()

            if (isSameDay) {
              // Один день: "25 января, 18:00-23:00"
              const dateStr = startDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
              })
              const startTime = startDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
              const endTime = endDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
              schedule = `${dateStr}, ${startTime}-${endTime}`
            } else {
              // Разные дни: "25 января 18:00 - 26 января 02:00"
              const startDateStr = startDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
              })
              const endDateStr = endDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
              })
              const startTime = startDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
              const endTime = endDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
              schedule = `${startDateStr} ${startTime} - ${endDateStr} ${endTime}`
            }
          } catch {
            // Если не удалось распарсить дату, используем исходные значения
            schedule = `${vacancy.start_time} - ${vacancy.end_time}`
          }
        } else if (vacancy.duration) {
          // Если есть только duration, показываем его
          const durationValue = parseFloat(vacancy.duration)
          if (!isNaN(durationValue)) {
            schedule = t('feedFallback.durationHours', { value: durationValue })
          }
        }

        // Определяем категорию из target_roles
        const category =
          vacancy.target_roles && vacancy.target_roles.length > 0 ? vacancy.target_roles[0] : 'chef'

        // Получаем название заведения из user
        const venueName =
          vacancy.user?.name || vacancy.user?.full_name || t('feedFallback.notSpecified')

        // Получаем местоположение
        const location =
          vacancy.location || vacancy.user?.location || t('feedFallback.notSpecified')

        return {
          id: String(vacancy.id),
          title: vacancy.title || t('feedFallback.vacancy'),
          venueName,
          location,
          schedule,
          salary,
          type: vacancyType,
          category,
          imageUrl: vacancy.user?.photo_url || vacancy.user?.profile_photo_url || undefined,
          urgent: vacancy.urgent || false,
          description: vacancy.description,
          requirements: vacancy.requirements,
          shiftType: vacancy.shift_type,
          canApply: vacancy.can_apply,
          applicationsCount: vacancy.applications_count,
          user: vacancy.user
            ? {
                id: vacancy.user.id,
                name: vacancy.user.name || vacancy.user.full_name || '',
                bio: vacancy.user.bio,
                phone: vacancy.user.phone,
                email: vacancy.user.email,
                average_rating: vacancy.user.average_rating,
                total_reviews: vacancy.user.total_reviews,
                restaurant_profile: vacancy.user.restaurant_profile,
              }
            : undefined,
        }
      })
      .filter(vacancy => {
        if (type && type !== 'all') {
          const permanentLabel = t('feedFallback.permanent')
          const oneTimeLabel = t('feedFallback.oneTime')
          if (type === 'permanent' && vacancy.type !== permanentLabel) return false
          if (type === 'one-time' && vacancy.type !== oneTimeLabel) return false
        }
        return true
      })
  }, [data, t, type])

  return {
    vacancies,
    isLoading,
    isFetching,
    error,
    refetch,
    meta: data?.meta,
  }
}

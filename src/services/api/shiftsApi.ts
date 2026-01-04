/**
 * API для работы со сменами через RTK Query
 */

import { api } from '@/store/api'
import { buildQueryParams } from './helpers'

export interface Shift {
  id: string
  title: string
  venue: string
  date: string
  time: string
  role: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface CreateShiftRequest {
  title: string
  venue: string
  date: string
  time: string
  role: string
}

/**
 * Параметры запроса для получения вакансий
 */
/**
 * Параметры запроса для получения вакансий
 * Только параметры, указанные в API документации
 */
export interface GetVacanciesParams {
  shift_type: 'vacancy' | 'replacement'
  position?: string // Позиция для фильтрации: chef, waiter, bartender, barista, manager, support
  specialization?: string // Специализация для фильтрации (опционально)
  city?: string // Фильтр по городу ресторана (ILIKE поиск)
  min_payment?: number // Минимальная оплата за смену
  max_payment?: number // Максимальная оплата за смену
  start_date?: string // Дата начала фильтрации (формат: YYYY-MM-DD)
  end_date?: string // Дата окончания фильтрации (формат: YYYY-MM-DD)
  urgent?: boolean // Срочные смены
  page?: number // Номер страницы для пагинации (по умолчанию: 1)
  per_page?: number // Количество смен на странице (по умолчанию: 20, макс: 100)
}

/**
 * Профиль ресторана из API
 */
export interface RestaurantProfileApi {
  city?: string
  cuisine_types?: string[]
  format?: string
  restaurant_format?: string 
}

/**
 * Пользователь (заведение) из API
 */
export interface UserApi {
  id: number
  name: string
  full_name?: string
  location?: string
  bio?: string
  phone?: string
  email?: string
  photo_url?: string | null
  profile_photo_url?: string | null
  restaurant_profile?: RestaurantProfileApi
  role?: string
  average_rating?: number
  total_reviews?: number
}

/**
 * Вакансия из API
 */
export interface VacancyApiItem {
  id: number
  title: string
  description?: string
  location?: string
  payment?: string | number
  hourly_rate?: string | number
  start_time?: string
  end_time?: string
  duration?: string
  urgent?: boolean
  shift_type?: 'vacancy' | 'replacement'
  position?: string // Позиция (chef, waiter, bartender, barista, manager, support)
  specialization?: string | null // Специализация сотрудника
  target_roles?: string[]
  requirements?: string
  status?: string
  applications_count?: number
  can_apply?: boolean
  created_at?: string
  updated_at?: string
  user?: UserApi
}

/**
 * Метаданные пагинации
 */
export interface PaginationMeta {
  current_page?: number
  next_page?: number | null
  prev_page?: number | null
  per_page?: number
  total_pages?: number
  total_count?: number
}

/**
 * Ответ API с вакансиями
 */
export interface VacanciesResponse {
  success: boolean
  data: VacancyApiItem[]
  meta?: PaginationMeta
  pagination?: PaginationMeta // API может возвращать как meta, так и pagination
}

/**
 * Запрос на отклик на смену
 */
export interface ApplyToShiftRequest {
  message?: string // Опциональное сообщение
}

/**
 * Ответ на отклик на смену
 */
export interface ApplyToShiftResponse {
  success: boolean
  message?: string
  data?: {
    application_id?: number
  }
}

/**
 * Ответ на отмену заявки
 */
export interface CancelApplicationResponse {
  success: boolean
  message?: string
}

export const shiftsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получить все смены
    getShifts: builder.query<Shift[], { status?: string; role?: string }>({
      query: params => ({
        url: '/shifts',
        params,
      }),
      providesTags: ['Shift'],
    }),

    // Получить вакансии (смены с shift_type=vacancy)
    getVacancies: builder.query<VacanciesResponse, GetVacanciesParams>({
      query: params => {
        const queryString = buildQueryParams(params as unknown as Record<string, unknown>)
        return {
          url: `/api/v1/shifts${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
      providesTags: ['Shift'],
      keepUnusedDataFor: 0, // Не кэшировать данные, чтобы всегда получать актуальные результаты
    }),

    // Получить смену по ID
    getShiftById: builder.query<Shift, string>({
      query: id => `/shifts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Shift', id }],
    }),

    // Создать смену
    createShift: builder.mutation<Shift, CreateShiftRequest>({
      query: body => ({
        url: '/shifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Обновить смену
    updateShift: builder.mutation<Shift, { id: string; data: Partial<CreateShiftRequest> }>({
      query: ({ id, data }) => ({
        url: `/shifts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Shift', id }],
    }),

    // Удалить смену
    deleteShift: builder.mutation<void, string>({
      query: id => ({
        url: `/shifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift'],
    }),

    // Откликнуться на смену
    applyToShift: builder.mutation<ApplyToShiftResponse, { id: number; data?: ApplyToShiftRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/shifts/${id}/apply`,
        method: 'POST',
        body: data || {},
      }),
      invalidatesTags: ['Shift', 'AppliedShift'],
    }),

    // Отменить заявку на смену
    cancelApplication: builder.mutation<CancelApplicationResponse, number>({
      query: id => ({
        url: `/api/v1/shifts/${id}/cancel_application`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift', 'AppliedShift'],
    }),

    // Получить смены, на которые поданы заявки
    getAppliedShifts: builder.query<VacanciesResponse, void>({
      query: () => ({
        url: '/api/v1/shifts/applied_shifts',
        method: 'GET',
      }),
      providesTags: ['AppliedShift'],
      keepUnusedDataFor: 60, // Кэшируем на 60 секунд
    }),
  }),
})

// Экспорт хуков для использования в компонентах
export const {
  useGetShiftsQuery,
  useGetVacanciesQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useApplyToShiftMutation,
  useCancelApplicationMutation,
  useGetAppliedShiftsQuery,
} = shiftsApi

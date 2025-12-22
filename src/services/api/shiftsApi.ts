/**
 * API для работы со сменами через RTK Query
 */

import { api } from '../../store/api'

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
export interface GetVacanciesParams {
  shift_type: 'vacancy' | 'replacement'
  urgent?: boolean
  location?: string
  min_payment?: number
  max_payment?: number
  start_date?: string // YYYY-MM-DD
  target_roles?: string[] // chef, waiter, bartender, barista, manager, support
  page?: number
  per_page?: number
}

/**
 * Профиль ресторана из API
 */
export interface RestaurantProfileApi {
  city?: string
  cuisine_types?: string[]
  format?: string
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
 * Ответ API с вакансиями
 */
export interface VacanciesResponse {
  success: boolean
  data: VacancyApiItem[]
  meta?: {
    current_page?: number
    per_page?: number
    total_pages?: number
    total_count?: number
  }
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
        const searchParams = new URLSearchParams()
        
        // Обязательный параметр
        searchParams.append('shift_type', params.shift_type)
        
        // Опциональные параметры
        if (params.urgent !== undefined) {
          searchParams.append('urgent', String(params.urgent))
        }
        if (params.location) {
          searchParams.append('location', params.location)
        }
        if (params.min_payment !== undefined) {
          searchParams.append('min_payment', String(params.min_payment))
        }
        if (params.max_payment !== undefined) {
          searchParams.append('max_payment', String(params.max_payment))
        }
        if (params.start_date) {
          searchParams.append('start_date', params.start_date)
        }
        if (params.target_roles && params.target_roles.length > 0) {
          params.target_roles.forEach(role => {
            searchParams.append('target_roles[]', role)
          })
        }
        if (params.page !== undefined) {
          searchParams.append('page', String(params.page))
        }
        if (params.per_page !== undefined) {
          searchParams.append('per_page', String(params.per_page))
        }

        return {
          url: `/api/v1/shifts?${searchParams.toString()}`,
          method: 'GET',
        }
      },
      providesTags: ['Shift'],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
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
} = shiftsApi

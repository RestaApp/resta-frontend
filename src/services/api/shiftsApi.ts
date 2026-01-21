/**
 * API для работы со сменами через RTK Query
 */

import { api } from '@/shared/api/api'
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

export interface CreateShiftBody {
  title: string
  description?: string
  start_time: string
  end_time: string
  payment?: number
  location?: string
  requirements?: string
  shift_type: 'vacancy' | 'replacement'
  urgent?: boolean
  position: string
  specialization?: string | null
}

export interface CreateShiftRequest {
  shift: CreateShiftBody
}

export interface CreateShiftResponse {
  success?: boolean
  data?: VacancyApiItem
  message?: string
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
  /**
   * Моя заявка на эту смену (если пользователь подавал заявку)
   */
  my_application?: {
    id: number
    applied_at?: string
    message?: string | null
    priority?: number
    responded_at?: string | null
    shift_id?: number
    status?: string
    user_id?: number
  }
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
  shift_id?: number // Когда формируем тело из клиента, сюда попадёт id смены
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
        url: '/api/v1/shifts',
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
      keepUnusedDataFor: 30, // Кэшировать данные 30 секунд для предотвращения потери данных при refetch
    }),

    // Получить смену по ID
    getShiftById: builder.query<Shift, string>({
      query: id => `/api/v1/shifts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Shift', id }],
    }),

    // Создать смену
    createShift: builder.mutation<CreateShiftResponse, CreateShiftRequest>({
      query: body => ({
        url: '/api/v1/shifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shift'],
    }),

    // Обновить смену
    updateShift: builder.mutation<Shift, { id: string; data: Partial<CreateShiftRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/v1/shifts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Shift', id }, 'Shift'],
    }),

    // Удалить смену
    deleteShift: builder.mutation<void, string>({
      query: id => ({
        url: `/api/v1/shifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shift'],
    }),

    // Откликнуться на смену (новый endpoint: создаём ресурс shift_application)
    // Входной формат сохраняет прежнюю сигнатуру { id, data } для обратной совместимости,
    // но отправляет тело { shift_id, ...data } на `/api/v1/shift_applications`.
    applyToShift: builder.mutation<ApplyToShiftResponse, { id: number; data?: ApplyToShiftRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/shift_applications`,
        method: 'POST',
        body: Object.assign({ shift_id: id }, data || {}),
      }),
      // Инвалидируем только список поданных заявок, не весь список смен
      invalidatesTags: ['AppliedShift'],
    }),

    // Отменить заявку на смену (новый endpoint: удаляем ресурс shift_application по id)
    // Параметр — id заявки (application id). Для обратной совместимости клиенты могут передавать
    // прежний shift id, но это повлечёт ошибку на сервере, поэтому убедитесь, что вызывающие хуки
    // используют application_id из ответа applyToShift.
    cancelApplication: builder.mutation<CancelApplicationResponse, number>({
      query: id => ({
        url: `/api/v1/shift_applications/${id}`,
        method: 'DELETE',
      }),
      // Инвалидируем список поданных заявок
      invalidatesTags: ['AppliedShift'],
    }),

    // Принять заявку (только для владельца смены / ресторана)
    acceptApplication: builder.mutation<ApplyToShiftResponse, number>({
      query: id => ({
        url: `/api/v1/shift_applications/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AppliedShift', 'Shift'],
    }),

    // Отклонить заявку (только для владельца смены / ресторана)
    rejectApplication: builder.mutation<ApplyToShiftResponse, number>({
      query: id => ({
        url: `/api/v1/shift_applications/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['AppliedShift', 'Shift'],
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
    
    // Получить мои смены (список смен текущего пользователя)
    getMyShifts: builder.query<Shift[], void>({
      query: () => ({
        url: '/api/v1/shifts/my_shifts',
        method: 'GET',
      }),
      providesTags: ['Shift'],
      keepUnusedDataFor: 60,
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
  useGetMyShiftsQuery,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} = shiftsApi

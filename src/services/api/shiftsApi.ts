/**
 * API для работы со сменами через RTK Query
 */

import { api } from '@/shared/api/api'
import { buildQueryParams, provideListTags } from './helpers'

/**
 * Смена из API (используется для старых endpoints)
 * @deprecated Используйте VacancyApiItem для новых endpoints
 */
export interface ShiftApi {
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

/** Аргументы обновления смены: id и тело без обёртки { shift } */
export interface UpdateShiftArgs {
  id: string
  body: Partial<CreateShiftBody>
}

export interface CreateShiftResponse {
  success?: boolean
  data?: VacancyApiItem
  message?: string
}

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
 * Используется в ответах API для вакансий
 */
export interface UserApi {
  id: number
  name: string
  full_name?: string
  city?: string
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

export interface EmployeeProfilePreviewApi {
  experience_years?: number
  position?: string
}

export interface ApplicantUserApi {
  id: number
  name?: string
  last_name?: string
  full_name?: string
  position?: string
  employee_profile?: EmployeeProfilePreviewApi | null
}

export interface ApplicationPreviewApiItem {
  id?: number
  shift_application_id?: number
  applied_at?: string
  message?: string | null
  priority?: number
  responded_at?: string | null
  shift_id?: number
  status?: string
  /** Статус заявки в API (pending, accepted, rejected) */
  shift_application_status?: string
  user?: ApplicantUserApi
  user_id?: number

  full_name?: string
  position?: string
  specializations?: string[]
  average_rating?: string | number
  experience_years?: number
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
  applications_preview?: ApplicationPreviewApiItem[]
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
    id?: number
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
    getShifts: builder.query<ShiftApi[], { status?: string; role?: string }>({
      query: params => ({
        url: '/api/v1/shifts',
        params,
      }),
      providesTags: result => provideListTags('Shift', result),
    }),

    // Получить вакансии (смены с shift_type=vacancy)
    getVacancies: builder.query<VacanciesResponse, GetVacanciesParams>({
      query: params => {
        const queryString = buildQueryParams(params)
        return {
          url: `/api/v1/shifts${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
      providesTags: result => provideListTags('Shift', result),
      keepUnusedDataFor: 30,
    }),

    // Получить смену по ID
    getShiftById: builder.query<ShiftApi, string>({
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
      invalidatesTags: [{ type: 'Shift', id: 'LIST' }],
    }),

    // Обновить смену (body — поля без обёртки, обёртка { shift } формируется здесь)
    updateShift: builder.mutation<ShiftApi, UpdateShiftArgs>({
      query: ({ id, body }) => ({
        url: `/api/v1/shifts/${id}`,
        method: 'PATCH',
        body: { shift: body },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Shift', id },
        { type: 'Shift', id: 'LIST' },
      ],
    }),

    // Удалить смену
    deleteShift: builder.mutation<void, string>({
      query: id => ({
        url: `/api/v1/shifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Shift', id },
        { type: 'Shift', id: 'LIST' },
      ],
    }),

    // Откликнуться на смену
    applyToShift: builder.mutation<
      ApplyToShiftResponse,
      { id: number; data?: ApplyToShiftRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/shift_applications`,
        method: 'POST',
        body: Object.assign({ shift_id: id }, data || {}),
      }),
      invalidatesTags: [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
      ],
    }),

    // Отменить заявку на смену (id — application id)
    cancelApplication: builder.mutation<CancelApplicationResponse, number>({
      query: id => ({
        url: `/api/v1/shift_applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
      ],
    }),

    // Принять заявку (только для владельца смены / ресторана). shiftId — для инвалидации кэша смены без перезагрузки.
    acceptApplication: builder.mutation<
      ApplyToShiftResponse,
      { applicationId: number; shiftId?: number }
    >({
      query: ({ applicationId }) => ({
        url: `/api/v1/shift_applications/${applicationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { shiftId }) => [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
        ...(typeof shiftId === 'number' ? [{ type: 'Shift' as const, id: String(shiftId) }] : []),
      ],
    }),

    // Отклонить заявку (только для владельца смены / ресторана). shiftId — для инвалидации кэша смены без перезагрузки.
    rejectApplication: builder.mutation<
      ApplyToShiftResponse,
      { applicationId: number; shiftId?: number }
    >({
      query: ({ applicationId }) => ({
        url: `/api/v1/shift_applications/${applicationId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { shiftId }) => [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: 'LIST' },
        ...(typeof shiftId === 'number' ? [{ type: 'Shift' as const, id: String(shiftId) }] : []),
      ],
    }),

    // Получить смены, на которые поданы заявки
    getAppliedShifts: builder.query<VacanciesResponse, void>({
      query: () => ({
        url: '/api/v1/shifts/applied_shifts',
        method: 'GET',
      }),
      providesTags: result => provideListTags('AppliedShift', result),
      keepUnusedDataFor: 60,
    }),

    // Получить мои смены (список смен текущего пользователя)
    getMyShifts: builder.query<VacanciesResponse, void>({
      query: () => ({
        url: '/api/v1/shifts/my_shifts',
        method: 'GET',
      }),
      providesTags: result => provideListTags('Shift', result),
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

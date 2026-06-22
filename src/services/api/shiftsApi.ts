/**
 * API для работы со сменами через RTK Query
 */

import { api } from '@/shared/api/api'
import { buildQueryParams, provideListTags } from './helpers'
import {
  parseShiftDetailFromResponse,
  type ApplyToShiftRequest,
  type ApplyToShiftResponse,
  type CancelApplicationResponse,
  type CreateShiftRequest,
  type CreateShiftResponse,
  type DeleteShiftResponse,
  type GetVacanciesParams,
  type MutateShiftResponse,
  type PaginatedListParams,
  type ReceivedShiftApplicationsResponse,
  type UpdateShiftArgs,
  type VacanciesResponse,
  type VacancyApiItem,
} from './shiftsApi.types'

/**
 * per_page для списков, которым нужен полный набор (множество откликнутых смен,
 * счётчик и модерация полученных заявок). Совпадает с максимумом бэка (100).
 * Край: при >100 записях у одного субъекта набор усечётся — тогда нужна курсорная пагинация.
 */
export const FULL_LIST_PER_PAGE = 100

const shiftsApi = api.injectEndpoints({
  endpoints: builder => ({
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
      keepUnusedDataFor: 300,
    }),

    // GET /api/v1/shifts/:id — детальный ShiftBlueprint (view :detail)
    getShiftById: builder.query<VacancyApiItem, string>({
      query: id => `/api/v1/shifts/${id}`,
      transformResponse: (response: unknown) => parseShiftDetailFromResponse(response),
      providesTags: (result, _error, idArg) =>
        result
          ? [
              { type: 'Shift', id: String(result.id) },
              { type: 'Shift', id: idArg },
            ]
          : [{ type: 'Shift', id: idArg }],
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
    updateShift: builder.mutation<MutateShiftResponse, UpdateShiftArgs>({
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
    deleteShift: builder.mutation<DeleteShiftResponse, string>({
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
      // Отклик меняет только конкретную смену (can_apply/my_application) — точечно,
      // без рефетча всей ленты. Лента обновится, т.к. провайдит тег этой смены.
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: String(id) },
      ],
    }),

    // Пригласить сотрудника на вакансию (ресторан)
    inviteToShift: builder.mutation<ApplyToShiftResponse, { shiftId: number; userId: number }>({
      query: ({ shiftId, userId }) => ({
        url: '/api/v1/shift_applications',
        method: 'POST',
        body: { shift_id: shiftId, user_id: userId },
      }),
      invalidatesTags: (_r, _e, { shiftId }) => [
        { type: 'AppliedShift', id: 'LIST' },
        { type: 'Shift', id: String(shiftId) },
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
      // Известен shiftId → точечно (тег нормализован к строке, лента обновится);
      // иначе fallback на LIST, чтобы списки владельца не остались устаревшими.
      invalidatesTags: (_result, _error, { shiftId }) =>
        typeof shiftId === 'number'
          ? [
              { type: 'AppliedShift', id: 'LIST' },
              { type: 'Shift', id: String(shiftId) },
            ]
          : [
              { type: 'AppliedShift', id: 'LIST' },
              { type: 'Shift', id: 'LIST' },
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
      invalidatesTags: (_result, _error, { shiftId }) =>
        typeof shiftId === 'number'
          ? [
              { type: 'AppliedShift', id: 'LIST' },
              { type: 'Shift', id: String(shiftId) },
            ]
          : [
              { type: 'AppliedShift', id: 'LIST' },
              { type: 'Shift', id: 'LIST' },
            ],
    }),

    // Получить смены, на которые поданы заявки.
    // Множество нужно целиком (красит карточки во всей ленте) — потребители шлют per_page=100.
    getAppliedShifts: builder.query<VacanciesResponse, PaginatedListParams | void>({
      query: params => {
        const queryString = buildQueryParams(params ?? {})
        return {
          url: `/api/v1/shifts/applied_shifts${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
      providesTags: result => provideListTags('AppliedShift', result),
      keepUnusedDataFor: 60,
    }),

    // Получить отклики на смены/вакансии текущего заведения.
    // Нужен полный набор: точный счётчик pending + модерация всех заявок — per_page=100.
    getReceivedShiftApplications: builder.query<
      ReceivedShiftApplicationsResponse,
      PaginatedListParams | void
    >({
      query: params => {
        const queryString = buildQueryParams(params ?? {})
        return {
          url: `/api/v1/shift_applications/received${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
      providesTags: result => provideListTags('AppliedShift', result),
      keepUnusedDataFor: 120,
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
  useGetVacanciesQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useApplyToShiftMutation,
  useInviteToShiftMutation,
  useCancelApplicationMutation,
  useGetAppliedShiftsQuery,
  useGetReceivedShiftApplicationsQuery,
  useGetMyShiftsQuery,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} = shiftsApi

export type * from './shiftsApi.types'

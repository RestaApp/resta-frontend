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
  type GetShiftsListParams,
  type GetVacanciesParams,
  type MutateShiftResponse,
  type ReceivedShiftApplicationsResponse,
  type UpdateShiftArgs,
  type VacanciesResponse,
  type VacancyApiItem,
} from './shiftsApi.types'

const shiftsApi = api.injectEndpoints({
  endpoints: builder => ({
    // GET /api/v1/shifts — параметры как в API.md (без legacy status/role)
    getShifts: builder.query<VacanciesResponse, GetShiftsListParams | void>({
      query: params => {
        const queryString = params ? buildQueryParams(params) : ''
        return {
          url: `/api/v1/shifts${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        }
      },
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

    // Получить отклики на смены/вакансии текущего заведения
    getReceivedShiftApplications: builder.query<ReceivedShiftApplicationsResponse, void>({
      query: () => ({
        url: '/api/v1/shift_applications/received',
        method: 'GET',
      }),
      providesTags: result => provideListTags('AppliedShift', result),
      keepUnusedDataFor: 30,
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
  useLazyGetVacanciesQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useApplyToShiftMutation,
  useCancelApplicationMutation,
  useGetAppliedShiftsQuery,
  useGetReceivedShiftApplicationsQuery,
  useGetMyShiftsQuery,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} = shiftsApi

export type * from './shiftsApi.types'

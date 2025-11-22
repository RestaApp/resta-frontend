/**
 * Пример API для работы со сменами через RTK Query
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
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} = shiftsApi

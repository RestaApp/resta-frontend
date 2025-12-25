/**
 * Хук для работы со сменами
 * Инкапсулирует логику работы со сменами
 */

import {
  useGetShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  type CreateShiftRequest,
  type Shift,
} from '../services/api/shiftsApi'

/**
 * Хук для получения списка смен
 */
export const useShifts = (params?: { status?: string; role?: string }) => {
  const { data, isLoading, isFetching, error, refetch } = useGetShiftsQuery(params ?? {})

  return {
    shifts: data ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

/**
 * Хук для получения смены по ID
 */
export const useShift = (id: string | null) => {
  const { data, isLoading, isFetching, error, refetch } = useGetShiftByIdQuery(id ?? '', {
    skip: !id,
  })

  return {
    shift: data ?? null,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

/**
 * Хук для создания смены
 */
export const useCreateShift = () => {
  const [createShiftMutation, { isLoading, error }] = useCreateShiftMutation()

  const createShift = async (request: CreateShiftRequest): Promise<Shift> => {
    return await createShiftMutation(request).unwrap()
  }

  return {
    createShift,
    isLoading,
    error,
  }
}

/**
 * Хук для обновления смены
 */
export const useUpdateShift = () => {
  const [updateShiftMutation, { isLoading, error }] = useUpdateShiftMutation()

  const updateShift = async (id: string, data: Partial<CreateShiftRequest>): Promise<Shift> => {
    return await updateShiftMutation({ id, data }).unwrap()
  }

  return {
    updateShift,
    isLoading,
    error,
  }
}

/**
 * Хук для удаления смены
 */
export const useDeleteShift = () => {
  const [deleteShiftMutation, { isLoading, error }] = useDeleteShiftMutation()

  const deleteShift = async (id: string): Promise<void> => {
    await deleteShiftMutation(id).unwrap()
  }

  return {
    deleteShift,
    isLoading,
    error,
  }
}


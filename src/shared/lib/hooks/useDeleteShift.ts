/**
 * Хук удаления смены (инкапсуляция мутации RTK Query).
 */

import { useDeleteShiftMutation } from '@/services/api/shiftsApi'

export const useDeleteShift = () => {
  const [deleteShiftMutation, { isLoading, error }] = useDeleteShiftMutation()

  const deleteShift = async (id: string) => {
    return await deleteShiftMutation(id).unwrap()
  }

  return {
    deleteShift,
    isLoading,
    error,
  }
}

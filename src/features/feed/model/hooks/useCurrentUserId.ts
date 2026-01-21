import { useMemo } from 'react'
import { getCurrentUserId } from '@/utils/user'

export const useCurrentUserId = (): number => {
  return useMemo(() => getCurrentUserId() ?? 0, [])
}

/**
 * Утилита для получения текущего userId из store
 * Возвращает undefined, если userId недоступен
 */
import { store } from '@/store'

export function getCurrentUserId(): number | undefined {
  try {
    const state = store.getState()
    return state.user.userData?.id
  } catch {
    return undefined
  }
}

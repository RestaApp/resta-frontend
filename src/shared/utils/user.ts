/**
 * Утилита для получения текущего userId из store
 * Возвращает undefined, если userId недоступен
 */
import { store } from '@/store'
import { selectUserId } from '@/shared/store/user'

export function getCurrentUserId(): number | undefined {
  try {
    const state = store.getState()
    return selectUserId(state)
  } catch {
    return undefined
  }
}

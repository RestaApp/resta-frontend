/**
 * Утилита для получения текущего userId из store (динамический импорт)
 * Возвращает undefined, если userId недоступен
 */
export async function getCurrentUserId(): Promise<number | undefined> {
  try {
    const { store } = await import('../store')
    const state = store.getState()
    return state.user.userData?.id
  } catch {
    return undefined
  }
}

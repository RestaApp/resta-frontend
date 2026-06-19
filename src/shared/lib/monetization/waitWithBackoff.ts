/**
 * Экспоненциальный backoff после оплаты Telegram Stars (webhook может прийти
 * с задержкой). Спеки SUBSCRIPTIONS/PURCHASES: 500ms, 1s, 2s, 4s, 8s.
 *
 * `attempt(i)` вызывается после паузы перед попыткой i (0-based). Возвращает
 * результат при первом не-null/непустом значении или `null`, если за все
 * попытки ничего не пришло («Оплата обрабатывается, попробуйте позже»).
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const waitWithBackoff = async <T>(
  attempt: (index: number) => Promise<T | null | undefined>,
  maxRetries = 5,
  baseDelayMs = 500
): Promise<T | null> => {
  for (let i = 0; i < maxRetries; i++) {
    await sleep(baseDelayMs * 2 ** i)
    const result = await attempt(i)
    if (result != null) return result
  }
  return null
}

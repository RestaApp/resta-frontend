/**
 * Добавляет схему https для ссылок без протокола (для href и открытия в новой вкладке)
 */
export function normalizeExternalUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

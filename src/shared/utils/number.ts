/** Единая числовая коэрция. Заменяет локальные toNumber/normalizeNumber. */

/** Конечное число или `fallback` (по умолчанию 0). `Number()`-семантика. */
export const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** Конечное число или `null` (для «значение отсутствует»). */
export const toFiniteNumberOrNull = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

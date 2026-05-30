import type { AdvancedFiltersData } from '@/shared/shifts/types'
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Минимальная проверка структуры после JSON.parse */
const parseFeedFilterTemplate = (raw: string | null): AdvancedFiltersData | null => {
  if (!raw?.trim()) return null
  try {
    const data = JSON.parse(raw) as unknown
    if (!isRecord(data)) return null
    return data as AdvancedFiltersData
  } catch {
    return null
  }
}

export const loadFeedFilterTemplate = (kind: 'shifts' | 'jobs'): AdvancedFiltersData | null => {
  const key =
    kind === 'shifts'
      ? STORAGE_KEYS.FEED_FILTER_TEMPLATE_SHIFTS
      : STORAGE_KEYS.FEED_FILTER_TEMPLATE_JOBS
  return parseFeedFilterTemplate(getLocalStorageItem(key))
}

export const saveFeedFilterTemplate = (
  kind: 'shifts' | 'jobs',
  filters: AdvancedFiltersData | null
): void => {
  const key =
    kind === 'shifts'
      ? STORAGE_KEYS.FEED_FILTER_TEMPLATE_SHIFTS
      : STORAGE_KEYS.FEED_FILTER_TEMPLATE_JOBS
  if (!filters) {
    removeLocalStorageItem(key)
    return
  }
  setLocalStorageItem(key, JSON.stringify(filters))
}

import type { VacanciesResponse, VacancyApiItem } from '@/services/api/shiftsApi'

export const normalizeVacanciesResponse = (data: unknown): VacancyApiItem[] => {
  if (Array.isArray(data)) return data as VacancyApiItem[]
  if (!data || typeof data !== 'object') return []

  const maybeResponse = data as Partial<VacanciesResponse> & { data?: unknown }
  const items = maybeResponse.data
  return Array.isArray(items) ? (items as VacancyApiItem[]) : []
}

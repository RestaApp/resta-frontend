import type { VacanciesResponse, VacancyApiItem } from '@/services/api/shiftsApi'

export const normalizeVacanciesResponse = (data: unknown): VacancyApiItem[] => {
  if (Array.isArray(data)) return data as VacancyApiItem[]
  const d = data as Partial<VacanciesResponse> | { data?: unknown }
  const items = (d as any)?.data
  return Array.isArray(items) ? (items as VacancyApiItem[]) : []
}


import type { ApplicationPreviewApiItem, VacancyApiItem } from '@/services/api/shiftsApi'

/** Список откликов для UI — только `applications_preview` из ответа API. */
export const getApplicationsPreview = (
  vacancy?: VacancyApiItem | null
): ApplicationPreviewApiItem[] => vacancy?.applications_preview ?? []

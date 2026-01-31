import type { VacancyApiItem } from '@/services/api/shiftsApi'

const APPLIED_STATUS_ORDER = ['pending', 'processing', 'accepted', 'rejected'] as const
const APPLIED_STATUS_LABELS: Record<string, string> = {
  pending: 'На рассмотрении',
  processing: 'На рассмотрении',
  accepted: 'Подтверждённые',
  rejected: 'Отклонённые',
}

/**
 * Группирует отклики по статусу для отображения в UI.
 * Статусы 'pending' и 'processing' объединяются в 'На рассмотрении'.
 */
export function groupAppliedByStatus(shifts: VacancyApiItem[]): { status: string; label: string; items: VacancyApiItem[] }[] {
  const groups: Record<string, VacancyApiItem[]> = {}
  for (const s of shifts) {
    const status = s.my_application?.status ?? 'pending'
    const key = status === 'pending' || status === 'processing' ? 'pending' : status
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return APPLIED_STATUS_ORDER.filter(key => groups[key]?.length).map(key => ({
    status: key,
    label: APPLIED_STATUS_LABELS[key] ?? key,
    items: groups[key] ?? [],
  }))
}

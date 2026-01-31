import type { VacancyApiItem } from '@/services/api/shiftsApi'

const APPLIED_STATUS_ORDER = ['pending', 'processing', 'accepted', 'rejected'] as const
/** Ключи i18n для подписей статусов откликов */
const APPLIED_STATUS_LABEL_KEYS: Record<string, string> = {
  pending: 'activity.statusPending',
  processing: 'activity.statusPending',
  accepted: 'activity.statusAccepted',
  rejected: 'activity.statusRejected',
}

/**
 * Группирует отклики по статусу для отображения в UI.
 * Возвращает label как ключ i18n — в компоненте вызывать t(label).
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
    label: APPLIED_STATUS_LABEL_KEYS[key] ?? key,
    items: groups[key] ?? [],
  }))
}

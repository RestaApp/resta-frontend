import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { groupByOrderedKeys } from '@/shared/utils/groupByOrderedKeys'

const APPLIED_STATUS_ORDER = ['pending', 'processing', 'accepted', 'rejected'] as const
/** Ключи i18n для подписей статусов откликов */
const APPLIED_STATUS_LABEL_KEYS: Record<string, string> = {
  pending: 'activity.statusPending',
  processing: 'activity.statusPending',
  accepted: 'activity.statusAccepted',
  rejected: 'activity.statusRejected',
}

const normalizeAppliedStatus = (status: string): string => {
  if (status === 'pending' || status === 'processing') return 'pending'
  return status
}

/**
 * Группирует отклики по статусу для отображения в UI.
 * Возвращает label как ключ i18n — в компоненте вызывать t(label).
 */
export function groupAppliedByStatus(
  shifts: VacancyApiItem[]
): { status: string; label: string; items: VacancyApiItem[] }[] {
  const grouped = groupByOrderedKeys(
    shifts,
    shift => normalizeAppliedStatus(shift.my_application?.status ?? 'pending'),
    APPLIED_STATUS_ORDER,
    APPLIED_STATUS_LABEL_KEYS
  )

  return grouped.map(({ key, label, items }) => ({
    status: key,
    label,
    items,
  }))
}

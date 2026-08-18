import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'

/** Канонический статус заявки. */
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

/** Любой сырой статус → литерал (всё, что не accepted/rejected — pending). */
export const normalizeApplicationStatus = (status: string | null | undefined): ApplicationStatus =>
  status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'pending'

/** Только pending/accepted блокируют повторный отклик; rejected можно подать заново. */
export const isActiveApplicationStatus = (status: string | null | undefined): boolean =>
  normalizeApplicationStatus(status) !== 'rejected'

type StatusFields = Pick<ApplicationPreviewApiItem, 'shift_application_status' | 'status'>
type IdFields = Pick<ApplicationPreviewApiItem, 'shift_application_id' | 'id'>

/** Статус заявки из любого формата API (плоский/вложенный, legacy-алиасы). */
export const getApplicationStatus = (app: StatusFields | null | undefined): ApplicationStatus =>
  normalizeApplicationStatus(app?.shift_application_status ?? app?.status)

/** ID заявки из любого формата (`shift_application_id` имеет приоритет над `id`). */
export const getApplicationId = (app: IdFields | null | undefined): number | null =>
  app?.shift_application_id ?? app?.id ?? null

import type { TFunction } from 'i18next'
import type { KpiItem } from '@/components/ui/kpi-row'
import type { UserData } from '@/services/api/authApi'
import type { ApiRole } from '@/shared/types/roles.types'
import type { getProfileCompleteness } from '@/shared/utils/profileCompleteness'

export type ProfileCompleteness = ReturnType<typeof getProfileCompleteness>

export interface ProfileTagItem {
  id: string
  label: string
}

export interface ProfileTagSection {
  id: string
  title: string
  items: ProfileTagItem[]
}

export type ProfileInfoValue =
  | {
      kind: 'text'
      value: string
      href?: string
      multiline?: boolean
    }
  | {
      kind: 'tags'
      values: ProfileTagItem[]
    }

export interface ProfileInfoRow {
  id: string
  label: string
  value: ProfileInfoValue
}

export interface ProfileInfoSection {
  id: string
  title: string
  rows: ProfileInfoRow[]
}

export interface ProfileWorkHistoryItem {
  id: string
  company: string
  position: string
  /** «Март 2022 — Январь 2024» или «Март 2022 — по наст. время» */
  period: string
  city: string
  description: string
  isCurrent: boolean
}

export interface ProfileReviewSummary {
  rating: string
  reviews: string
}

export interface ProfileViewModel {
  userProfile: UserData
  apiRole: ApiRole | null
  userName: string
  roleLabel: string
  isProfileFilled: boolean
  fillRequiredText: string
  kpis: KpiItem[]
  /** Доп. ряд KPI из GET /analytics/my (просмотры/клики за месяц). Только свой профиль. */
  analyticsKpis: KpiItem[]
  tagSections: ProfileTagSection[]
  workHistory: ProfileWorkHistoryItem[]
  infoSections: ProfileInfoSection[]
  reviewSummary: ProfileReviewSummary | null
  showNotificationSettings: boolean
  showSupport: boolean
}

export interface ProfileStats {
  completedShifts: number
  myShiftsCount: number
}

export interface ProfileLabelHelpers {
  getSpecializationLabel: (value: string) => string
  getSupplierTypeLabel: (value: string) => string
  getRestaurantFormatLabel: (value: string) => string
  getCuisineTypeLabel: (value: string) => string
}

export interface BuildProfileViewModelParams extends ProfileStats, ProfileLabelHelpers {
  t: TFunction
  userProfile: UserData
  apiRole: ApiRole | null
  userName: string
  roleLabel: string
  completeness: ProfileCompleteness | null
  /** Скрыть KPI и блок отзывов (например, поставщик смотрит карточку ресторана). */
  hideMetrics?: boolean
  /** GET /analytics/my — только для своего профиля; на чужих не передаётся. */
  profileViewsThisMonth?: number | null
  contactClicksThisMonth?: number | null
}

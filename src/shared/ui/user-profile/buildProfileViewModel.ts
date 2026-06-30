import type { TFunction } from 'i18next'
import type { ApiRole } from '@/shared/types/roles.types'
import { buildAnalyticsKpis, buildKpis, buildReviewSummary } from './profileViewModelKpis'
import { buildInfoSections, buildTagSections, buildWorkHistory } from './profileViewModelSections'
import type { BuildProfileViewModelParams, ProfileViewModel } from './profileViewModel.types'

// Типы вынесены в profileViewModel.types.ts; ре-экспортируем для обратной
// совместимости потребителей (импортируют их из этого модуля).
export type {
  BuildProfileViewModelParams,
  ProfileCompleteness,
  ProfileInfoRow,
  ProfileInfoSection,
  ProfileInfoValue,
  ProfileLabelHelpers,
  ProfileReviewSummary,
  ProfileStats,
  ProfileTagItem,
  ProfileTagSection,
  ProfileViewModel,
  ProfileWorkHistoryItem,
} from './profileViewModel.types'

const getFillRequiredText = (t: TFunction, apiRole: ApiRole | null) => {
  if (apiRole === 'restaurant') return t('profile.fillToApplyRestaurant')
  if (apiRole === 'supplier') return t('profile.fillToApplySupplier')
  return t('profile.fillToApply')
}

/**
 * Собирает view-model профиля из `UserData` + хелперов лейблов.
 * Тяжёлые билдеры вынесены: KPI → `profileViewModelKpis`, секции (теги/история/
 * инфо-ряды) → `profileViewModelSections`. Здесь — только оркестрация.
 */
export const buildProfileViewModel = (params: BuildProfileViewModelParams): ProfileViewModel => {
  const { t, apiRole, userProfile, userName, roleLabel, completeness, hideMetrics = false } = params

  return {
    userProfile,
    apiRole,
    userName,
    roleLabel,
    isProfileFilled: completeness?.isFilled ?? false,
    fillRequiredText: getFillRequiredText(t, apiRole),
    kpis: hideMetrics ? [] : buildKpis(params),
    analyticsKpis: hideMetrics ? [] : buildAnalyticsKpis(params),
    tagSections: buildTagSections(params),
    workHistory: buildWorkHistory(params),
    infoSections: buildInfoSections(params),
    reviewSummary: hideMetrics ? null : buildReviewSummary(userProfile),
    showNotificationSettings: apiRole !== 'supplier',
    showSupport: apiRole != null && apiRole !== 'unverified',
  }
}

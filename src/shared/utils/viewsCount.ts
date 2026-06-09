import i18n from '@/shared/i18n/config'

export const formatViewsCount = (count: number): string => {
  const safeCount = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0
  return i18n.t('shift.viewsCount', { count: safeCount })
}

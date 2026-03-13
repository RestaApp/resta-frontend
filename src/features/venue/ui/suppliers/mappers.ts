import type { TFunction } from 'i18next'
import type { SupplierApiUser, SupplierItem } from './types'

export const formatServiceCategory = (value: string): string => value.split('_').join(' ').trim()

const getSupplierName = (item: SupplierApiUser, fallback: string) => {
  const profile = item.supplier_profile ?? item.supplier_profile_attributes ?? null
  const fromParts = [item.name, item.last_name].filter(Boolean).join(' ').trim()
  return item.full_name || profile?.name || fromParts || fallback
}

const normalizeRating = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const normalizeReviewsCount = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const getSupplierProfile = (item: SupplierApiUser) =>
  item.supplier_profile ?? item.supplier_profile_attributes ?? null

const getSupplierCategories = (item: SupplierApiUser): string[] => {
  const profile = getSupplierProfile(item)
  const fromApi = profile?.supplier_types && Array.isArray(profile.supplier_types)
    ? profile.supplier_types
    : []
  return fromApi.filter(Boolean)
}

export const mapSupplierUsersToItems = (
  users: SupplierApiUser[],
  t: TFunction,
  getSupplierTypeLabel: (value: string) => string
): SupplierItem[] => {
  return users.map(item => {
    const profile = getSupplierProfile(item)
    const categories = getSupplierCategories(item)
    const supplierTypeCode = profile?.supplier_category ?? profile?.supplier_type ?? null
    const categoriesLabel =
      categories.length > 0
        ? categories
            .map(category =>
              t(`labels.supplierType.${category}`, {
                defaultValue: formatServiceCategory(category),
              })
            )
            .join(', ')
        : null

    return {
      id: item.id,
      bio: item.bio ?? null,
      city: item.city || t('common.notSpecified', { defaultValue: 'Не указано' }),
      location: item.location || t('common.notSpecified', { defaultValue: 'Не указано' }),
      email: item.email || t('common.notSpecified', { defaultValue: 'Не указано' }),
      phone: item.phone || t('common.notSpecified', { defaultValue: 'Не указано' }),
      averageRating: normalizeRating(item.average_rating),
      totalReviews: normalizeReviewsCount(item.total_reviews),
      username: item.username || null,
      supplierType: categoriesLabel || t('common.notSpecified', { defaultValue: 'Не указано' }),
      supplierCategory: supplierTypeCode
        ? getSupplierTypeLabel(supplierTypeCode)
        : t('common.notSpecified', { defaultValue: 'Не указано' }),
      serviceCategories: categories,
      deliveryAvailable:
        typeof profile?.delivery_available === 'boolean' ? profile.delivery_available : null,
      name: getSupplierName(item, t('common.user', { defaultValue: `Поставщик #${item.id}` })),
      status: item.active ? 'active' : 'paused',
    }
  })
}

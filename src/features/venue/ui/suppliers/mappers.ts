import type { TFunction } from 'i18next'
import type { RestaurantApiUser, SupplierApiUser, SupplierItem } from './types'
import { formatServiceCategory } from '@/components/ui/shift-details-screen/formatServiceCategory'
import type { UserData } from '@/services/api/usersApi'

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
  const fromApi =
    profile?.supplier_types && Array.isArray(profile.supplier_types) ? profile.supplier_types : []
  return fromApi.filter(Boolean)
}

const getUserPhotoUrl = (
  item: Pick<UserData, 'photo_url' | 'profile_photo_url'>
): string | null => {
  const raw = item.photo_url ?? item.profile_photo_url
  if (typeof raw !== 'string') return null
  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : null
}

export const getRestaurantProfile = (item: RestaurantApiUser) =>
  item.restaurant_profile ?? item.restaurant_profile_attributes ?? null

export const mapRestaurantUsersToItems = (
  users: RestaurantApiUser[],
  t: TFunction,
  getRestaurantFormatLabel: (value: string) => string
): SupplierItem[] => {
  return users.map(item => {
    const profile = getRestaurantProfile(item)
    const restaurantFormatCode = profile?.restaurant_format ?? profile?.format ?? null
    const cuisines = Array.isArray(profile?.cuisine_types)
      ? profile.cuisine_types.filter(Boolean)
      : []
    const formatLabel = restaurantFormatCode
      ? getRestaurantFormatLabel(restaurantFormatCode)
      : t('common.notSpecified', { defaultValue: 'Не указано' })
    const fromParts = [item.name, item.last_name].filter(Boolean).join(' ').trim()

    return {
      id: item.id,
      name:
        item.full_name ||
        fromParts ||
        t('venueUi.suppliers.unknownName', { defaultValue: `Заведение #${item.id}` }),
      bio: item.bio ?? null,
      website: item.website?.trim() || '',
      city: item.city?.trim() || '',
      location: item.location?.trim() || '',
      email: item.email?.trim() || '',
      phone: item.phone?.trim() || '',
      averageRating: Number.isFinite(item.average_rating) ? item.average_rating : 0,
      totalReviews: Number.isFinite(item.total_reviews) ? item.total_reviews : 0,
      username: item.username || null,
      photoUrl: getUserPhotoUrl(item),
      supplierType: formatLabel,
      supplierCategory: formatLabel,
      serviceCategories: cuisines,
      deliveryAvailable: null,
      status: item.active ? 'active' : 'paused',
    }
  })
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
      website: item.website?.trim() || '',
      city: item.city?.trim() || '',
      location: item.location?.trim() || '',
      email: item.email?.trim() || '',
      phone: item.phone?.trim() || '',
      averageRating: normalizeRating(item.average_rating),
      totalReviews: normalizeReviewsCount(item.total_reviews),
      username: item.username || null,
      photoUrl: getUserPhotoUrl(item),
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

import type { TFunction } from 'i18next'
import type { RestaurantApiUser, SupplierApiUser, SupplierItem } from './types'
import { formatServiceCategory } from '@/shared/utils/formatServiceCategory'
import { toLocationArray } from '@/shared/utils/location'
import {
  getUserPhotoUrl,
  normalizeRating,
  normalizeReviewsCount,
} from '@/shared/utils/userFieldNormalizers'

const getSupplierName = (item: SupplierApiUser, fallback: string) => {
  const profile = item.supplier_profile ?? item.supplier_profile_attributes ?? null
  const fromParts = [item.name, item.last_name].filter(Boolean).join(' ').trim()
  return item.full_name || profile?.name || fromParts || fallback
}

const getSupplierProfile = (item: SupplierApiUser) =>
  item.supplier_profile ?? item.supplier_profile_attributes ?? null

const getSupplierCategories = (item: SupplierApiUser): string[] => {
  const profile = getSupplierProfile(item)
  const fromApi =
    profile?.supplier_types && Array.isArray(profile.supplier_types) ? profile.supplier_types : []
  return fromApi.filter(Boolean)
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
      location: toLocationArray(item.location),
      email: item.email?.trim() || '',
      phone: item.phone?.trim() || '',
      averageRating: Number.isFinite(item.average_rating) ? item.average_rating : 0,
      totalReviews: Number.isFinite(item.total_reviews) ? item.total_reviews : 0,
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
      location: toLocationArray(item.location),
      email: item.email?.trim() || '',
      phone: item.phone?.trim() || '',
      averageRating: normalizeRating(item.average_rating),
      totalReviews: normalizeReviewsCount(item.total_reviews),
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

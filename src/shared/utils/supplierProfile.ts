import type { SupplierProfile } from '@/services/api/authApi'

export type SupplierProfileSource = {
  supplier_profile?: SupplierProfile | null
  supplier_profile_attributes?: SupplierProfile | null
}

/** Профиль поставщика из основного или nested-атрибута UserData. */
export const getSupplierProfile = (
  user: SupplierProfileSource | null | undefined
): SupplierProfile | null => user?.supplier_profile ?? user?.supplier_profile_attributes ?? null

/** Нормализованный список типов: supplier_types или fallback на supplier_type. */
export const getSupplierTypes = (profile: SupplierProfile | null | undefined): string[] => {
  if (!profile) return []

  if (Array.isArray(profile.supplier_types)) {
    return Array.from(new Set(profile.supplier_types.filter(Boolean)))
  }

  if (profile.supplier_type) {
    return [profile.supplier_type]
  }

  return []
}

export const getSupplierCategory = (profile: SupplierProfile | null | undefined): string | null =>
  profile?.supplier_category?.trim() || null

import type { UpdateUserRequest } from '@/services/api/usersApi'
import { normalizeCatalogPosition } from '@/shared/utils/roles'

export type RegistrationProfileData =
  | {
      role: 'employee'
      position?: string | null
      specializations?: string[]
    }
  | {
      role: 'supplier'
      supplierCategory: string
      supplierTypes: string[]
      deliveryAvailable?: boolean
    }
  | {
      role: 'restaurant'
      restaurantFormat: string
    }

type UserUpdatePayload = UpdateUserRequest['user']
type EmployeeProfileAttributes = NonNullable<UserUpdatePayload['employee_profile_attributes']>
type SupplierProfileAttributes = NonNullable<UserUpdatePayload['supplier_profile_attributes']>
type RestaurantProfileAttributes = NonNullable<UserUpdatePayload['restaurant_profile_attributes']>

const uniqueStrings = (values: string[]) =>
  Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))

const mergeEmployeeProfileAttributes = (
  user: UserUpdatePayload,
  attributes: EmployeeProfileAttributes
) => {
  user.employee_profile_attributes = {
    ...user.employee_profile_attributes,
    ...attributes,
  }
}

const mergeSupplierProfileAttributes = (
  user: UserUpdatePayload,
  attributes: SupplierProfileAttributes
) => {
  user.supplier_profile_attributes = {
    ...user.supplier_profile_attributes,
    ...attributes,
  }
}

const mergeRestaurantProfileAttributes = (
  user: UserUpdatePayload,
  attributes: RestaurantProfileAttributes
) => {
  user.restaurant_profile_attributes = {
    ...user.restaurant_profile_attributes,
    ...attributes,
  }
}

export const buildRegistrationUpdateUserRequest = (
  data: RegistrationProfileData
): UpdateUserRequest => {
  const user: UserUpdatePayload = { role: data.role }

  if (data.role === 'employee') {
    const employeeAttributes: EmployeeProfileAttributes = {}
    const positionRaw = data.position?.trim()
    const position = positionRaw ? normalizeCatalogPosition(positionRaw) : undefined
    const specializations = uniqueStrings(data.specializations ?? [])

    if (position) {
      user.position = position
      employeeAttributes.position = position
    }

    if (specializations.length > 0) {
      user.specializations = specializations
      employeeAttributes.specializations = specializations
    }

    if (Object.keys(employeeAttributes).length > 0) {
      mergeEmployeeProfileAttributes(user, employeeAttributes)
    }
  }

  if (data.role === 'supplier') {
    const supplierCategory = data.supplierCategory.trim()
    const supplierTypes = uniqueStrings(data.supplierTypes)
    const deliveryAvailable = data.deliveryAvailable ?? false

    user.supplier_category = supplierCategory
    user.supplier_types = supplierTypes
    user.delivery_available = deliveryAvailable
    mergeSupplierProfileAttributes(user, {
      supplier_category: supplierCategory,
      supplier_types: supplierTypes,
      delivery_available: deliveryAvailable,
    })
  }

  if (data.role === 'restaurant') {
    const restaurantFormat = data.restaurantFormat.trim()
    user.restaurant_format = restaurantFormat
    mergeRestaurantProfileAttributes(user, {
      restaurant_format: restaurantFormat,
    })
  }

  return { user }
}

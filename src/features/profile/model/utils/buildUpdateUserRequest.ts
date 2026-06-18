import type { ApiRole } from '@/shared/types/roles.types'
import type { UpdateUserRequest } from '@/services/api/usersApi'
import { toE164 } from '@/shared/utils/phone'
import { sanitizeLocations } from '@/shared/utils/location'
import { sanitizeWorkHistory, type WorkHistoryFormEntry } from '@/shared/utils/workHistory'

import { formValueToBusinessHoursRecord } from '@/features/profile/model/utils/businessHoursForm'

export interface ProfileFormData {
  name: string
  lastName: string
  bio: string
  city: string
  /** Адреса заведения (для restaurant / supplier). Для employee всегда []. */
  location: string[]
  email: string
  phone: string
  workExperienceSummary: string
  /** Заведение: сайт */
  website: string
  /** Заведение: время работы (многострочный текст → business_hours.schedule) */
  businessHours: string
  // Для employee
  position: string
  experienceYears: number | ''
  openToWork: boolean
  skills: string
  specializations: string[]
  /** История работы (только для employee) */
  workHistory: WorkHistoryFormEntry[]
  // Для supplier
  supplierCategory: string
  supplierTypes: string[]
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

/**
 * Строит запрос на обновление пользователя из данных формы
 */
export const buildUpdateUserRequest = (
  formData: ProfileFormData,
  apiRole: ApiRole | null,
  initialFormData?: ProfileFormData
): UpdateUserRequest => {
  const isBusinessRole = apiRole === 'restaurant' || apiRole === 'supplier'
  const source = initialFormData ?? formData
  const hasDiff = <T>(current: T, initial: T) => {
    return JSON.stringify(current) !== JSON.stringify(initial)
  }

  const normalizeStringOrNull = (value: string) => value.trim() || null

  const currentName = formData.name.trim()
  const initialName = source.name.trim()
  const currentLastName = formData.lastName.trim()
  const initialLastName = source.lastName.trim()
  const currentBio = normalizeStringOrNull(formData.bio)
  const initialBio = normalizeStringOrNull(source.bio)
  const currentCity = normalizeStringOrNull(formData.city)
  const initialCity = normalizeStringOrNull(source.city)
  const currentLocation = sanitizeLocations(formData.location)
  const initialLocation = sanitizeLocations(source.location)
  const currentWebsite = normalizeStringOrNull(formData.website)
  const initialWebsite = normalizeStringOrNull(source.website)
  const currentBusinessHours = formValueToBusinessHoursRecord(formData.businessHours) ?? null
  const initialBusinessHours = formValueToBusinessHoursRecord(source.businessHours) ?? null
  const currentEmail = normalizeStringOrNull(formData.email)
  const initialEmail = normalizeStringOrNull(source.email)
  const currentPhone = toE164(formData.phone.trim()) || null
  const initialPhone = toE164(source.phone.trim()) || null
  const currentWorkExperienceSummary = normalizeStringOrNull(formData.workExperienceSummary)
  const initialWorkExperienceSummary = normalizeStringOrNull(source.workExperienceSummary)
  const currentSkills = formData.skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const initialSkills = source.skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const currentSpecializations = uniqueStrings(formData.specializations)
  const initialSpecializations = uniqueStrings(source.specializations)
  const currentSupplierCategory = formData.supplierCategory.trim()
  const initialSupplierCategory = source.supplierCategory.trim()
  const currentSupplierTypes = uniqueStrings(formData.supplierTypes)
  const initialSupplierTypes = uniqueStrings(source.supplierTypes)

  const user: UpdateUserRequest['user'] = {}

  if (currentName && currentName !== initialName) {
    user.name = currentName

    if (apiRole === 'restaurant') {
      mergeRestaurantProfileAttributes(user, { name: currentName })
    }

    if (apiRole === 'supplier') {
      mergeSupplierProfileAttributes(user, { name: currentName })
    }
  }

  if (apiRole === 'employee' && currentLastName !== initialLastName) {
    user.last_name = currentLastName
  }

  if (currentBio !== initialBio) {
    user.bio = currentBio
  }

  if (currentCity !== initialCity) {
    user.city = currentCity
  }

  if (isBusinessRole && hasDiff(currentLocation, initialLocation)) {
    user.location = currentLocation
  }

  if (isBusinessRole && currentWebsite !== initialWebsite) {
    user.website = currentWebsite
  }

  if (isBusinessRole && hasDiff(currentBusinessHours, initialBusinessHours)) {
    user.business_hours = currentBusinessHours
  }

  if (currentEmail !== initialEmail) {
    user.email = currentEmail
  }

  if (currentPhone !== initialPhone) {
    user.phone = currentPhone
  }

  if (currentWorkExperienceSummary !== initialWorkExperienceSummary) {
    user.work_experience_summary = currentWorkExperienceSummary
  }

  if (apiRole === 'employee') {
    const employeeProfileAttributes: NonNullable<
      UpdateUserRequest['user']['employee_profile_attributes']
    > = {}
    const currentPosition = formData.position.trim()
    const initialPosition = source.position.trim()

    if (currentPosition && currentPosition !== initialPosition) {
      user.position = currentPosition
      employeeProfileAttributes.position = currentPosition
    }

    if (formData.experienceYears !== source.experienceYears && formData.experienceYears !== '') {
      user.experience_years = formData.experienceYears
      employeeProfileAttributes.experience_years = formData.experienceYears
    }

    if (formData.openToWork !== source.openToWork) {
      user.open_to_work = formData.openToWork
      employeeProfileAttributes.open_to_work = formData.openToWork
    }

    if (hasDiff(currentSkills, initialSkills)) {
      user.skills = currentSkills
      employeeProfileAttributes.skills = currentSkills
    }

    if (hasDiff(currentSpecializations, initialSpecializations)) {
      user.specializations = currentSpecializations
      employeeProfileAttributes.specializations = currentSpecializations
    }

    // work_history — поле уровня user, передаётся целиком (бэкенд заменяет всё поле).
    const currentWorkHistory = sanitizeWorkHistory(formData.workHistory)
    const initialWorkHistory = sanitizeWorkHistory(source.workHistory)
    if (hasDiff(currentWorkHistory, initialWorkHistory)) {
      user.work_history = currentWorkHistory
    }

    if (Object.keys(employeeProfileAttributes).length > 0) {
      mergeEmployeeProfileAttributes(user, employeeProfileAttributes)
    }
  }

  if (apiRole === 'supplier') {
    const supplierProfileAttributes: SupplierProfileAttributes = {}

    if (hasDiff(currentSupplierTypes, initialSupplierTypes)) {
      user.supplier_types = currentSupplierTypes
      supplierProfileAttributes.supplier_types = currentSupplierTypes

      if (currentSupplierCategory) {
        user.supplier_category = currentSupplierCategory
        supplierProfileAttributes.supplier_category = currentSupplierCategory
      }
    }

    if (
      currentSupplierCategory &&
      currentSupplierCategory !== initialSupplierCategory &&
      !user.supplier_category
    ) {
      user.supplier_category = currentSupplierCategory
      supplierProfileAttributes.supplier_category = currentSupplierCategory
    }

    if (Object.keys(supplierProfileAttributes).length > 0) {
      mergeSupplierProfileAttributes(user, supplierProfileAttributes)
    }
  }

  return {
    user,
  }
}

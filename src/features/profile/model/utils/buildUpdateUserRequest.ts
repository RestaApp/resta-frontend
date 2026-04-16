import type { ApiRole } from '@/types'
import type { UpdateUserRequest } from '@/services/api/usersApi'
import { toE164 } from '@/utils/phone'

import { formValueToBusinessHoursRecord } from '@/features/profile/model/utils/businessHoursForm'

export interface ProfileFormData {
  name: string
  lastName: string
  bio: string
  city: string
  location: string
  email: string
  phone: string
  workExperienceSummary: string
  /** Заведение: сайт */
  website: string
  /** Заведение: время работы (многострочный текст → business_hours.schedule) */
  businessHours: string
  // Для employee
  experienceYears: number | ''
  openToWork: boolean
  skills: string
  // Для supplier
  supplierCategory: string
  supplierTypes: string[]
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
  const currentLocation = normalizeStringOrNull(formData.location)
  const initialLocation = normalizeStringOrNull(source.location)
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
  const currentSupplierCategory = formData.supplierCategory.trim()
  const initialSupplierCategory = source.supplierCategory.trim()
  const currentSupplierTypes = Array.from(new Set(formData.supplierTypes.filter(Boolean)))
  const initialSupplierTypes = Array.from(new Set(source.supplierTypes.filter(Boolean)))

  const user: UpdateUserRequest['user'] = {}

  if (currentName && currentName !== initialName) {
    user.name = currentName
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

  if (isBusinessRole && currentLocation !== initialLocation) {
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

    if (formData.experienceYears !== source.experienceYears && formData.experienceYears !== '') {
      employeeProfileAttributes.experience_years = formData.experienceYears
    }

    if (formData.openToWork !== source.openToWork) {
      employeeProfileAttributes.open_to_work = formData.openToWork
    }

    if (hasDiff(currentSkills, initialSkills)) {
      employeeProfileAttributes.skills = currentSkills
    }

    if (Object.keys(employeeProfileAttributes).length > 0) {
      user.employee_profile_attributes = employeeProfileAttributes
    }
  }

  if (apiRole === 'supplier' && hasDiff(currentSupplierTypes, initialSupplierTypes)) {
    user.supplier_types = currentSupplierTypes

    if (currentSupplierCategory) {
      user.supplier_category = currentSupplierCategory
      user.supplier_profile_attributes = {
        supplier_category: currentSupplierCategory,
        supplier_types: currentSupplierTypes,
      }
    }
  }

  if (
    apiRole === 'supplier' &&
    currentSupplierCategory &&
    currentSupplierCategory !== initialSupplierCategory &&
    !user.supplier_category
  ) {
    user.supplier_category = currentSupplierCategory
  }

  return {
    user,
  }
}

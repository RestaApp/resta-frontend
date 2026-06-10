import type { UserData } from '@/services/api/usersApi'
import type { UsersListType } from '@/services/api/usersApi'

export interface EmployeeCatalogItem {
  id: number
  name: string
  position: string
  positionKey: string | null
  specializationKeys: string[]
  city: string
  experienceYears: number | null
  averageRating: number
  totalReviews: number
  photoUrl: string | null
}

export interface EmployeeCatalogFilters {
  city: string
  position: string | null
  specialization: string | null
}

export const DEFAULT_EMPLOYEE_CATALOG_FILTERS: EmployeeCatalogFilters = {
  city: '',
  position: null,
  specialization: null,
}

export const EMPLOYEES_PER_PAGE = 20

export type EmployeeApiUser = UserData

export const resolveEmployeeUserType = (position: string | null): UsersListType =>
  (position as UsersListType) || 'employees'

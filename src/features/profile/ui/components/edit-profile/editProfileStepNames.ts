import type { ApiRole } from '@/shared/types/roles.types'

const EMPLOYEE_STEP_NAME_KEYS = [
  'profile.editProfileSteps.basic',
  'profile.editProfileSteps.professional',
  'profile.editProfileSteps.about',
] as const

const RESTAURANT_STEP_NAME_KEYS = [
  'profile.editProfileSteps.basic',
  'profile.editProfileSteps.schedule',
  'profile.editProfileSteps.venue',
] as const

const SUPPLIER_STEP_NAME_KEYS = [
  'profile.editProfileSteps.basic',
  'profile.editProfileSteps.details',
] as const

export const getEditProfileStepNameKey = (
  apiRole: ApiRole | null,
  step: number
): string | undefined => {
  if (apiRole === 'employee') {
    return EMPLOYEE_STEP_NAME_KEYS[step]
  }

  if (apiRole === 'restaurant') {
    return RESTAURANT_STEP_NAME_KEYS[step]
  }

  if (apiRole === 'supplier') {
    return SUPPLIER_STEP_NAME_KEYS[step]
  }

  return undefined
}

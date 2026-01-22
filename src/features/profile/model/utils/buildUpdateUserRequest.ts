import type { ApiRole } from '@/types'
import type { UpdateUserRequest } from '@/services/api/usersApi'

export interface ProfileFormData {
  name: string
  lastName: string
  bio: string
  city: string
  email: string
  phone: string
  workExperienceSummary: string
  // Для employee
  experienceYears: number | ''
  openToWork: boolean
  skills: string
}

/**
 * Строит запрос на обновление пользователя из данных формы
 */
export const buildUpdateUserRequest = (
  formData: ProfileFormData,
  apiRole: ApiRole | null
): UpdateUserRequest => {
  return {
    user: {
      name: formData.name.trim() || undefined,
      ...(apiRole === 'employee' && formData.lastName.trim() && { last_name: formData.lastName.trim() }),
      bio: formData.bio.trim() || null,
      city: formData.city.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      work_experience_summary: formData.workExperienceSummary.trim() || null,
      ...(apiRole === 'employee' && {
        employee_profile_attributes: {
          ...(formData.experienceYears !== '' &&
            typeof formData.experienceYears === 'number' && {
              experience_years: formData.experienceYears,
            }),
          open_to_work: formData.openToWork,
          ...(formData.skills.trim() && {
            skills: formData.skills
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0),
          }),
        },
      }),
    },
  }
}

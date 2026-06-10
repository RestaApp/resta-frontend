import { memo } from 'react'
import { BusinessHoursField } from '../business-fields/BusinessHoursField'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'

interface EditProfileStepBusinessScheduleProps {
  formData: ProfileFormData
  isLoading: boolean
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

/** Шаг 2 для ресторана: график работы (будни, выходные, быстрые действия). */
export const EditProfileStepBusinessSchedule = memo(function EditProfileStepBusinessSchedule({
  formData,
  isLoading,
  updateField,
}: EditProfileStepBusinessScheduleProps) {
  return (
    <BusinessHoursField
      value={formData.businessHours}
      disabled={isLoading}
      variant="schedule"
      onChange={next => updateField('businessHours', next)}
    />
  )
})

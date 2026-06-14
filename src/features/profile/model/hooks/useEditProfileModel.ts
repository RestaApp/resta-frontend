import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateUser } from '@/shared/lib/hooks/useUsers'
import { useUserProfile } from '@/shared/lib/hooks/useUserProfile'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useCities } from '@/shared/lib/hooks/useCities'
import { mapRoleFromApi } from '@/shared/utils/roles'
import type { ApiRole } from '@/shared/types/roles.types'
import type { ProfileFormData } from '../utils/buildUpdateUserRequest'
import { businessHoursRecordToFormValue } from '../utils/businessHoursForm'
import { formatPhoneInput } from '@/shared/utils/phone'
import { useGetSupplierTypesQuery } from '@/services/api/rolesApi'
import { toLocationArray } from '@/shared/utils/location'
import {
  getSupplierCategory,
  getSupplierProfile,
  getSupplierTypes,
} from '@/shared/utils/supplierProfile'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useEditProfileFormController, type EditProfileStep } from './useEditProfileFormController'

export const useEditProfileModel = (
  open: boolean,
  onSuccess?: () => void,
  initialStep: EditProfileStep | null = null
) => {
  const { t } = useTranslation()
  const { userProfile } = useUserProfile({ forceRefetch: open })
  const { updateUser, isLoading } = useUpdateUser()
  const { showToast } = useToast()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: open })

  // Определяем роль
  const apiRole = useMemo<ApiRole | null>(() => {
    const roleValue = userProfile?.role
    if (!roleValue) return null
    return mapRoleFromApi(roleValue)
  }, [userProfile?.role])

  const supplierCategory = useMemo(() => {
    if (apiRole !== 'supplier') return null
    return getSupplierCategory(getSupplierProfile(userProfile))
  }, [apiRole, userProfile])

  const {
    data: supplierTypesResponse,
    isLoading: isSupplierTypesLoading,
    isFetching: isSupplierTypesFetching,
  } = useGetSupplierTypesQuery(supplierCategory ?? '', {
    skip: !open || apiRole !== 'supplier' || !supplierCategory,
  })

  const supplierTypeOptions = supplierTypesResponse?.data ?? []

  const baseFormData = useMemo<ProfileFormData>(() => {
    if (!userProfile) {
      return {
        name: '',
        lastName: '',
        bio: '',
        city: '',
        location: [],
        email: '',
        phone: '',
        workExperienceSummary: '',
        website: '',
        businessHours: '',
        position: '',
        experienceYears: '',
        openToWork: false,
        skills: '',
        specializations: [],
        supplierCategory: '',
        supplierTypes: [],
      }
    }

    const ep = userProfile.employee_profile
    const supplierProfile = getSupplierProfile(userProfile)
    return {
      name:
        apiRole === 'restaurant'
          ? userProfile.restaurant_profile?.name?.trim() || userProfile.name || ''
          : userProfile.name || '',
      lastName: userProfile.last_name || '',
      bio: userProfile.bio || '',
      city: userProfile.city ?? '',
      location: toLocationArray(userProfile.location),
      email: userProfile.email || '',
      phone: formatPhoneInput(userProfile.phone || '') || userProfile.phone || '',
      workExperienceSummary: userProfile.work_experience_summary || '',
      website: userProfile.website?.trim() || '',
      businessHours: businessHoursRecordToFormValue(userProfile.business_hours),
      position: apiRole === 'employee' ? (ep?.position ?? userProfile.position ?? '').trim() : '',
      experienceYears:
        apiRole === 'employee' && ep
          ? typeof ep.experience_years === 'number'
            ? ep.experience_years
            : ''
          : '',
      openToWork: apiRole === 'employee' && ep ? ep.open_to_work || false : false,
      skills: apiRole === 'employee' && ep?.skills ? ep.skills.join(', ') : '',
      specializations:
        apiRole === 'employee'
          ? Array.from(
              new Set(
                (ep?.specializations?.length
                  ? ep.specializations
                  : [userProfile.specialization]
                ).filter((value): value is string => Boolean(value))
              )
            )
          : [],
      supplierCategory: supplierProfile?.supplier_category ?? '',
      supplierTypes: getSupplierTypes(supplierProfile),
    }
  }, [apiRole, userProfile])

  const { positions, isLoading: isPositionsLoading } = useUserPositions({
    enabled: open && apiRole === 'employee',
  })

  const {
    formData,
    step,
    totalSteps,
    showCityWarning,
    setShowCityWarning,
    fieldErrors,
    handleNext,
    handleBack,
    handleSave,
    updateField,
    handleSaveWithoutCity,
    resetForm,
    openForm,
  } = useEditProfileFormController({
    apiRole,
    userId: userProfile?.id,
    baseFormData,
    initialStep,
    onSuccess,
    updateUser,
    showToast,
    t,
  })

  const activePosition =
    apiRole === 'employee' ? formData.position || baseFormData.position || null : null

  const { specializations: specializationOptions, isLoading: isSpecializationsLoading } =
    useUserSpecializations({
      position: activePosition,
      enabled: open && apiRole === 'employee' && Boolean(activePosition),
    })
  const experienceYearsForSlider =
    typeof formData.experienceYears === 'number' ? formData.experienceYears : 0

  return {
    userProfile,
    apiRole,
    formData,
    cities,
    isCitiesLoading,
    isLoading,
    positions,
    isPositionsLoading,
    specializationOptions,
    isSpecializationsLoading,
    supplierTypeOptions,
    isSupplierTypesLoading: isSupplierTypesLoading || isSupplierTypesFetching,
    supplierCategory,
    experienceYearsForSlider,
    step,
    totalSteps,
    handleNext,
    handleBack,
    handleSave,
    updateField,
    showCityWarning,
    setShowCityWarning,
    fieldErrors,
    handleSaveWithoutCity,
    resetForm,
    openForm,
  }
}

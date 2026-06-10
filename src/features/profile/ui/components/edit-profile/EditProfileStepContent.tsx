import { memo, type RefObject } from 'react'
import type { ApiRole, EmployeeSubRole } from '@/shared/types/roles.types'
import type { ProfileFormData } from '../../../model/utils/buildUpdateUserRequest'
import { EditProfileStepBasic } from './EditProfileStepBasic'
import { EditProfileStepProfessional } from './EditProfileStepProfessional'
import { EditProfileStepAbout } from './EditProfileStepAbout'
import { EditProfileStepBusinessSchedule } from './EditProfileStepBusinessSchedule'
import { EditProfileStepVenueInfo } from './EditProfileStepVenueInfo'
import { EditProfileStepSupplierInfo } from './EditProfileStepSupplierInfo'

type EditProfileField = 'name' | 'lastName' | 'phone' | 'city' | 'position' | 'specializations'

export interface EditProfileStepContentProps {
  apiRole: ApiRole | null
  step: number
  formData: ProfileFormData
  fieldErrors: Partial<Record<EditProfileField, string>>
  cities: string[]
  isCitiesLoading: boolean
  isLoading: boolean
  photoUrl: string | null
  bioSuffix: string
  experienceYearsForSlider: number
  positions: EmployeeSubRole[]
  isPositionsLoading: boolean
  specializationOptions: string[]
  isSpecializationsLoading: boolean
  specializationRef: RefObject<HTMLDivElement | null>
  supplierTypeOptions: string[]
  isSupplierTypesLoading: boolean
  supplierTypesRef: RefObject<HTMLDivElement | null>
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void
}

export const EditProfileStepContent = memo(function EditProfileStepContent({
  apiRole,
  step,
  formData,
  fieldErrors,
  cities,
  isCitiesLoading,
  isLoading,
  photoUrl,
  bioSuffix,
  experienceYearsForSlider,
  positions,
  isPositionsLoading,
  specializationOptions,
  isSpecializationsLoading,
  specializationRef,
  supplierTypeOptions,
  isSupplierTypesLoading,
  supplierTypesRef,
  updateField,
}: EditProfileStepContentProps) {
  if (apiRole === 'employee') {
    if (step === 0) {
      return (
        <EditProfileStepBasic
          apiRole={apiRole}
          formData={formData}
          fieldErrors={fieldErrors}
          cities={cities}
          isCitiesLoading={isCitiesLoading}
          isLoading={isLoading}
          photoUrl={photoUrl}
          updateField={updateField}
        />
      )
    }

    if (step === 1) {
      return (
        <EditProfileStepProfessional
          formData={formData}
          fieldErrors={fieldErrors}
          experienceYearsValue={experienceYearsForSlider}
          positions={positions}
          isPositionsLoading={isPositionsLoading}
          specializationOptions={specializationOptions}
          isSpecializationsLoading={isSpecializationsLoading}
          specializationRef={specializationRef}
          disabled={isLoading}
          updateField={updateField}
        />
      )
    }

    return (
      <EditProfileStepAbout
        formData={formData}
        bioSuffix={bioSuffix}
        isLoading={isLoading}
        updateField={updateField}
      />
    )
  }

  if (apiRole === 'restaurant' || apiRole === 'supplier') {
    if (step === 0) {
      return (
        <EditProfileStepBasic
          apiRole={apiRole}
          formData={formData}
          fieldErrors={fieldErrors}
          cities={cities}
          isCitiesLoading={isCitiesLoading}
          isLoading={isLoading}
          updateField={updateField}
        />
      )
    }

    if (step === 1) {
      return (
        <EditProfileStepBusinessSchedule
          formData={formData}
          isLoading={isLoading}
          updateField={updateField}
        />
      )
    }

    if (apiRole === 'restaurant') {
      return (
        <EditProfileStepVenueInfo
          apiRole={apiRole}
          formData={formData}
          bioSuffix={bioSuffix}
          isLoading={isLoading}
          updateField={updateField}
        />
      )
    }

    return (
      <EditProfileStepSupplierInfo
        formData={formData}
        bioSuffix={bioSuffix}
        isLoading={isLoading}
        supplierTypeOptions={supplierTypeOptions}
        isSupplierTypesLoading={isSupplierTypesLoading}
        supplierTypesRef={supplierTypesRef}
        updateField={updateField}
      />
    )
  }

  if (step === 0) {
    return (
      <EditProfileStepBasic
        apiRole={apiRole}
        formData={formData}
        fieldErrors={fieldErrors}
        cities={cities}
        isCitiesLoading={isCitiesLoading}
        isLoading={isLoading}
        updateField={updateField}
      />
    )
  }

  return (
    <EditProfileStepAbout
      formData={formData}
      bioSuffix={bioSuffix}
      isLoading={isLoading}
      updateField={updateField}
    />
  )
})

import type { RefObject } from 'react'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'

export type SelectFieldOption = {
  value: string
  label: string
}

export interface AddShiftDrawerProgressProps {
  step: number
  totalSteps: number
  stepTitle: string
}

export interface AddShiftDrawerStep0Props {
  titleRef: RefObject<HTMLDivElement | null>
  dateRef: RefObject<HTMLDivElement | null>
  timeRef: RefObject<HTMLDivElement | null>
  showScheduleFields: boolean
  showShiftTypeSelect: boolean
  shiftType: ShiftType
  onShiftTypeChange: (value: string) => void
  shiftTypeOptions: SelectFieldOption[]
  titleLabel: string
  titlePlaceholder: string
  title: string
  onTitleChange: (value: string) => void
  titleError?: string
  date: string | null
  onDateChange: (value: string | null) => void
  dateError?: string
  startTime: string
  onStartTimeChange: (value: string) => void
  startTimeError?: string
  endTime: string
  onEndTimeChange: (value: string) => void
  endTimeError?: string
  pay: string
  onPayChange: (value: string) => void
  payLabel?: string
  payPlaceholder?: string
}

export interface AddShiftDrawerStep1Props {
  locationRef: RefObject<HTMLDivElement | null>
  positionRef: RefObject<HTMLDivElement | null>
  specializationRef: RefObject<HTMLDivElement | null>
  location: string
  onLocationChange: (value: string) => void
  locationError?: string
  formPosition: string
  onPositionChange: (value: string) => void
  positionOptions: SelectFieldOption[]
  isPositionsLoading: boolean
  positionError?: string
  specializations: string[]
  onSpecializationsChange: (value: string[]) => void
  availableSpecializations: string[]
  isSpecializationsLoading: boolean
  specializationError?: string
}

export interface AddShiftDrawerStep2Props {
  descriptionRef: RefObject<HTMLDivElement | null>
  requirementsRef: RefObject<HTMLDivElement | null>
  description: string
  onDescriptionChange: (value: string) => void
  descriptionError?: string
  requirements: string
  onRequirementsChange: (value: string) => void
  requirementsError?: string
  urgent: boolean
  onUrgentChange: (value: boolean) => void
  isVacancyType?: boolean
}

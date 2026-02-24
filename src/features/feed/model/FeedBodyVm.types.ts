import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { ToastType } from '@/components/ui/toast'
import type { ShiftStatus } from '@/components/ui/StatusPill'
import type { AdvancedFiltersData } from '@/features/feed/ui/components/AdvancedFilters'
import type { FeedType, Shift } from './types'
import type { UseVacanciesInfiniteListReturn } from './hooks/useVacanciesInfiniteList'

export interface ProfileAlertState {
  open: boolean
  message: string
  missingFields: string[]
}

/** View-model для FeedBody (совпадает с полями useFeedPageModel для передачи без маппинга) */
export interface FeedBodyVm {
  feedType: FeedType
  filteredShifts: Shift[]
  activeList: UseVacanciesInfiniteListReturn

  openShiftDetails: (id: number) => void
  getApplicationId: (id: number) => number | undefined
  getApplicationStatus: (id: number) => ShiftStatus
  isApplied: (id: number) => boolean
  handleApply: (id: number, message?: string) => Promise<void>
  handleApplyWithModal: (id: number, message?: string) => Promise<void>
  handleCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isShiftLoading: (id: number) => boolean
  handleEdit: (id: number) => void
  handleDelete: (id: number) => Promise<void>
  isDeleting: boolean

  selectedShiftId: number | null
  selectedShift: Shift | null
  selectedVacancy: VacancyApiItem | null
  closeShiftDetails: () => void

  toast: { message: string; type: ToastType; isVisible: boolean }
  hideToast: () => void

  hasActiveFilters: boolean
  emptyMessage: string
  emptyDescription: string
  resetFilters: () => void

  profileAlert: ProfileAlertState
  closeProfileAlert: () => void
  openProfileEdit: () => void

  isFiltersOpen: boolean
  closeFilters: () => void
  applyAdvancedFilters: (f: AdvancedFiltersData | null) => void
  advancedFilters: AdvancedFiltersData | null
  filteredCount: number
  resetFeedFilters: () => void
  isVacancy: boolean
}

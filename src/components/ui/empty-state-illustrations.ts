import applications from '@/assets/illustrations/empty-applications.png'
import filters from '@/assets/illustrations/empty-filters.png'
import inbox from '@/assets/illustrations/empty-inbox.svg'
import search from '@/assets/illustrations/empty-search.svg'
import shiftApplicants from '@/assets/illustrations/empty-shift-applicants.png'
import shifts from '@/assets/illustrations/empty-shifts.svg'

export type EmptyIllustrationId =
  | 'filters'
  | 'search'
  | 'applications'
  | 'shift-applicants'
  | 'inbox'
  | 'shifts'

export const EMPTY_ILLUSTRATIONS: Record<EmptyIllustrationId, string> = {
  filters,
  search,
  applications,
  'shift-applicants': shiftApplicants,
  inbox,
  shifts,
}

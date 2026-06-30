import { useMemo } from 'react'
import { useGetReceivedShiftApplicationsQuery, FULL_LIST_PER_PAGE } from '@/services/api/shiftsApi'
import { countPendingStaffApplications, mapStaffApplicationsToItems } from './staffApplicationUtils'

/** Data-слой staff-applications: загрузка списка откликов + производные. */
export const useStaffApplicationsData = () => {
  const {
    data: applicationsData,
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
    refetch: refetchApplications,
  } = useGetReceivedShiftApplicationsQuery({ per_page: FULL_LIST_PER_PAGE })

  const applications = useMemo(
    () =>
      applicationsData?.data && Array.isArray(applicationsData.data) ? applicationsData.data : [],
    [applicationsData]
  )

  const pendingApplicationsCount = useMemo(
    () => countPendingStaffApplications(applications),
    [applications]
  )

  const staffItems = useMemo(() => mapStaffApplicationsToItems(applications), [applications])

  return {
    isApplicationsLoading,
    isApplicationsError,
    refetchApplications,
    pendingApplicationsCount,
    staffItems,
  }
}

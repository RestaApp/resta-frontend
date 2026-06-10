import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyShiftsQuery } from '@/services/api/shiftsApi'
import { useAuth } from '@/app/contexts/auth'
import {
  getHeaderAction,
  getHeaderTitle,
  resolveIsEmployeeFlow,
} from '@/components/appHeaderConfig'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { hasActiveEmployeeShift } from '@/shared/shifts/activeShift'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'

export const useActivityScreenHeader = (screenTab: Tab, role: UiRole | null) => {
  const { t } = useTranslation()
  const isEmployeeFlow = resolveIsEmployeeFlow(role)
  const { isAuthenticated } = useAuth()
  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !isAuthenticated || !isEmployeeFlow,
  })
  const myShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])
  const canEmployeeOfferShift = !hasActiveEmployeeShift(myShifts)

  const title = useMemo(() => getHeaderTitle(screenTab, t, role), [role, screenTab, t])
  const action = useMemo(
    () =>
      getHeaderAction({
        activeTab: screenTab,
        t,
        role,
        isEmployeeFlow,
        canEmployeeOfferShift,
      }),
    [canEmployeeOfferShift, isEmployeeFlow, role, screenTab, t]
  )

  return {
    title,
    action,
    showAddShiftOnboarding: isEmployeeFlow,
  }
}

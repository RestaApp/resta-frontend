import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, TrendingUp, User } from 'lucide-react'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { useAppDispatch } from '@/store/hooks'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'
import type { ApiRole } from '@/types'

interface EmployeeStats {
  completedShifts: number
  activeApplications: number
}

interface ProfileStatsProps {
  apiRole: ApiRole | null
  employeeStats?: EmployeeStats
  myShiftsCount: number
  appliedShiftsCount: number
}

export const ProfileStats = memo(
  ({ apiRole, employeeStats, myShiftsCount, appliedShiftsCount }: ProfileStatsProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    if (!apiRole) return null

    return (
      <div className="flex items-center gap-3 text-sm flex-wrap">
        {apiRole === 'employee' && employeeStats ? (
          <>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 stroke-[1.5]" style={{ color: 'var(--purple-deep)' }} />
              <span className="font-bold">{employeeStats.completedShifts}</span>
              <span className="text-muted-foreground">{t('profile.completedShifts')}</span>
            </div>
            <span className="text-border">·</span>
            <button
              type="button"
              className="flex items-center gap-2 hover:underline"
              onClick={() => {
                setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS, 'true')
                dispatch(navigateToTab('activity'))
              }}
            >
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="font-bold">{employeeStats.activeApplications}</span>
              <span className="text-muted-foreground">{t('profile.activeApplications')}</span>
            </button>
          </>
        ) : null}

        {apiRole === 'restaurant' ? (
          <>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: 'var(--purple-deep)' }} />
              <span className="font-bold">{myShiftsCount}</span>
              <span className="text-muted-foreground">{t('profile.shiftsCreated')}</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--purple-deep)' }} />
              <span className="font-bold">{appliedShiftsCount}</span>
              <span className="text-muted-foreground">{t('profile.activeRequests')}</span>
            </div>
          </>
        ) : null}

        {apiRole === 'supplier' ? (
          <>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--purple-deep)' }} />
              <span className="font-bold">—</span>
              <span className="text-muted-foreground">{t('profile.views')}</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: 'var(--purple-deep)' }} />
              <span className="font-bold">—</span>
              <span className="text-muted-foreground">{t('profile.activeClients')}</span>
            </div>
          </>
        ) : null}
      </div>
    )
  }
)
ProfileStats.displayName = 'ProfileStats'

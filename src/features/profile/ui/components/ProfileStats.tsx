import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, TrendingUp, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
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

export const ProfileStats = memo(({ apiRole, employeeStats, myShiftsCount, appliedShiftsCount }: ProfileStatsProps) => {
  const { t } = useTranslation()
  if (!apiRole) return null

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('profile.stats')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {apiRole === 'employee' && employeeStats && (
          <>
            <Card className="p-4">
              <div className="text-center py-2">
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                <div className="text-sm mb-1">{t('profile.completedShifts')}</div>
                <p className="text-lg font-semibold">{employeeStats.completedShifts}</p>
              </div>
            </Card>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => {
                setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS, 'true')
                window.dispatchEvent(new CustomEvent('navigateToActivityMyApplications'))
              }}
            >
              <Card className="p-4 cursor-pointer active:opacity-90 transition-opacity">
                <div className="text-center py-2">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                  <div className="text-sm mb-1">{t('profile.activeApplications')}</div>
                  <p className="text-lg font-semibold">{employeeStats.activeApplications}</p>
                </div>
              </Card>
            </button>
          </>
        )}

        {apiRole === 'restaurant' && (
          <>
            <Card className="p-4">
              <div className="text-center py-2">
                <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                <div className="text-sm mb-1">{t('profile.shiftsCreated')}</div>
                <p className="text-lg font-semibold">{myShiftsCount}</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center py-2">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                <div className="text-sm mb-1">{t('profile.activeRequests')}</div>
                <p className="text-lg font-semibold">{appliedShiftsCount}</p>
              </div>
            </Card>
          </>
        )}

        {apiRole === 'supplier' && (
          <>
            <Card className="p-4">
              <div className="text-center py-2">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--purple-deep)' }} />
                <div className="text-sm mb-1">{t('profile.views')}</div>
                <p className="text-lg font-semibold">—</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center py-2">
                <User className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--pink-electric)' }} />
                <div className="text-sm mb-1">{t('profile.activeClients')}</div>
                <p className="text-lg font-semibold">—</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
})
ProfileStats.displayName = 'ProfileStats'

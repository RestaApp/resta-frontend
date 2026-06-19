/**
 * Контент тура «что где зачем» по ролям. Иконка и заголовок шага берутся из
 * каталога вкладок (`tabs.ts`), текст — отдельные i18n-ключи `onboarding.tour.*`.
 */
import { getTabsForRole } from '@/shared/constants/tabs'
import { isEmployeeRole } from '@/shared/utils/roles'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'

export interface RoleTourStep {
  tabId: Tab
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  /** i18n-ключ заголовка (лейбл вкладки). */
  titleKey: string
  /** i18n-ключ пояснения «что/зачем». */
  textKey: string
}

type TourCategory = 'employee' | 'venue' | 'supplier'

const getTourCategory = (role: UiRole): TourCategory =>
  isEmployeeRole(role) ? 'employee' : role === 'venue' ? 'venue' : 'supplier'

/** Текст-ключи по категории и id вкладки. */
const TOUR_TEXT_KEYS: Record<TourCategory, Partial<Record<Tab, string>>> = {
  employee: {
    feed: 'onboarding.tour.employee.feed',
    activity: 'onboarding.tour.employee.activity',
    myshifts: 'onboarding.tour.employee.myshifts',
    profile: 'onboarding.tour.employee.profile',
  },
  venue: {
    activity: 'onboarding.tour.venue.activity',
    staff: 'onboarding.tour.venue.staff',
    suppliers: 'onboarding.tour.venue.suppliers',
    profile: 'onboarding.tour.venue.profile',
  },
  supplier: {
    home: 'onboarding.tour.supplier.home',
    profile: 'onboarding.tour.supplier.profile',
  },
}

/** Шаги тура для роли в порядке вкладок нижней навигации. */
export const getRoleTourSteps = (role: UiRole): RoleTourStep[] => {
  const textKeys = TOUR_TEXT_KEYS[getTourCategory(role)]
  return getTabsForRole(role).reduce<RoleTourStep[]>((acc, tab) => {
    const textKey = textKeys[tab.id]
    if (textKey) acc.push({ tabId: tab.id, icon: tab.icon, titleKey: tab.label, textKey })
    return acc
  }, [])
}

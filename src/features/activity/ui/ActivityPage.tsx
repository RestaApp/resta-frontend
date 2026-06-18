import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActivityPageModel } from '../model/hooks/useActivityPageModel'
import { useActivityScreenHeader } from '../model/hooks/useActivityScreenHeader'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/store/slices/userSlice'
import type { TabOption } from '@/components/ui/tabs'
import type { Tab } from '@/shared/types/navigation.types'
import type { ActivityTab } from '@/shared/types/activity.types'

import { ActivityPageHeader } from './components/ActivityPageHeader'
import { VenueActivityContent } from './components/VenueActivityContent'
import { EmployeeActivityContent } from './components/EmployeeActivityContent'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

type VenueTab = 'vacancies' | 'shifts'

interface ActivityPageProps {
  screenTab: Tab
  employeeDefaultTab?: ActivityTab
}

export const ActivityPage = ({
  screenTab,
  employeeDefaultTab = 'applications',
}: ActivityPageProps) => {
  const { t } = useTranslation()
  const m = useActivityPageModel(employeeDefaultTab)
  const selectedRole = useAppSelector(selectSelectedRole)
  const isVenue = selectedRole === 'venue'
  const header = useActivityScreenHeader(screenTab, selectedRole)
  const [venueTab, setVenueTab] = useState<VenueTab>('vacancies')

  const venueTabOptions = useMemo<TabOption<VenueTab>[]>(
    () => [
      { id: 'vacancies', label: t('tabs.feed.jobs') },
      { id: 'shifts', label: t('tabs.feed.shifts') },
    ],
    [t]
  )

  const venueItems = useMemo(
    () =>
      m.shifts.filter(item =>
        venueTab === 'vacancies' ? item.shift_type === 'vacancy' : item.shift_type === 'replacement'
      ),
    [m.shifts, venueTab]
  )
  const hasAnyVenueItems = m.shifts.length > 0
  const venueEmptyContent = useMemo(() => {
    if (!hasAnyVenueItems) {
      return {
        title: t('feed.venueEmptyTitle'),
        description: t('feed.venueEmptyDescription'),
      }
    }

    if (venueTab === 'vacancies') {
      return {
        title: t('venueUi.activityEmpty.noVacanciesTitle', {
          defaultValue: 'У вас пока нет вакансий',
        }),
        description: t('venueUi.activityEmpty.noVacanciesDescription', {
          defaultValue:
            'Создайте первую вакансию — кандидаты начнут откликаться, и вы увидите их здесь.',
        }),
      }
    }

    return {
      title: t('venueUi.activityEmpty.noShiftsTitle', {
        defaultValue: 'У вас пока нет смен',
      }),
      description: t('venueUi.activityEmpty.noShiftsDescription', {
        defaultValue:
          'Создайте первую смену — кандидаты начнут откликаться, и вы увидите их здесь.',
      }),
    }
  }, [hasAnyVenueItems, t, venueTab])

  useEffect(() => {
    if (!isVenue) return
    const type = venueTab === 'vacancies' ? 'vacancy' : 'replacement'
    emitAppEvent(APP_EVENTS.SET_VENUE_CREATE_TYPE, { type })
  }, [isVenue, venueTab])

  return (
    <div className="bg-background">
      {isVenue ? (
        <ActivityPageHeader
          title={header.title}
          action={header.action}
          tabOptions={venueTabOptions}
          activeTabId={venueTab}
          onTabChange={setVenueTab}
        />
      ) : (
        <ActivityPageHeader
          title={header.title}
          action={header.action}
          showAddShiftOnboarding={header.showAddShiftOnboarding}
        />
      )}

      {isVenue ? (
        <VenueActivityContent
          t={t}
          model={m}
          venueTab={venueTab}
          venueItems={venueItems}
          venueEmptyContent={venueEmptyContent}
        />
      ) : (
        <EmployeeActivityContent model={m} />
      )}
    </div>
  )
}

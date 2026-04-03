import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActivityPageModel } from '../model/hooks/useActivityPageModel'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import type { TabOption } from '@/components/ui/tabs'
import { Briefcase, Clock3 } from 'lucide-react'
import { VenueActivityContent } from './components/VenueActivityContent'
import { EmployeeActivityContent } from './components/EmployeeActivityContent'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

type VenueTab = 'vacancies' | 'shifts'

export const ActivityPage = () => {
  const { t } = useTranslation()
  const m = useActivityPageModel()
  const selectedRole = useAppSelector(selectSelectedRole)
  const isVenue = selectedRole === 'venue'
  const [venueTab, setVenueTab] = useState<VenueTab>('vacancies')

  const venueTabOptions = useMemo<TabOption<VenueTab>[]>(
    () => [
      { id: 'vacancies', label: t('tabs.feed.jobs'), icon: Briefcase },
      { id: 'shifts', label: t('tabs.feed.shifts'), icon: Clock3 },
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
        <VenueActivityContent
          t={t}
          model={m}
          venueTab={venueTab}
          setVenueTab={setVenueTab}
          venueTabOptions={venueTabOptions}
          venueItems={venueItems}
          venueEmptyContent={venueEmptyContent}
        />
      ) : (
        <EmployeeActivityContent t={t} model={m} />
      )}
    </div>
  )
}

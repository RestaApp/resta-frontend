import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { AddShiftDrawer } from '@/features/activity/ui/components/AddShiftDrawer'
import { useActivityPageModel } from '../model/hooks/useActivityPageModel'
import { ActivityHeader } from './components/ActivityHeader'
import { ActivityListTab } from './components/ActivityListTab'
import { ActivityCalendarTab } from './components/ActivityCalendarTab'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { Tabs, type TabOption } from '@/components/ui/tabs'
import { Briefcase, Clock3 } from 'lucide-react'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { Button } from '@/components/ui/button'
import { PersonalShiftCard } from './components/PersonalShiftCard'

type ActivityPageModel = ReturnType<typeof useActivityPageModel>
type VenueTab = 'vacancies' | 'shifts'

interface VenueEmptyContent {
  title: string
  description: string
}

interface VenueActivityContentProps {
  t: TFunction
  model: ActivityPageModel
  venueTab: VenueTab
  setVenueTab: (value: VenueTab) => void
  venueTabOptions: TabOption<VenueTab>[]
  venueItems: ActivityPageModel['shifts']
  venueEmptyContent: VenueEmptyContent
}

const VenueActivityContent = ({
  t,
  model,
  venueTab,
  setVenueTab,
  venueTabOptions,
  venueItems,
  venueEmptyContent,
}: VenueActivityContentProps) => {
  const handleOpenCreate = () => window.dispatchEvent(new CustomEvent('openActivityAddShift'))

  return (
    <>
      <div className="top-0 z-10 bg-background/95 backdrop-blur-sm transition-all border-border/50 px-4 py-2">
        <Tabs options={venueTabOptions} activeId={venueTab} onChange={setVenueTab} />
      </div>

      <div className="p-4">
        <PullToRefresh onRefresh={model.refreshList} disabled={model.isLoading}>
          {model.isError ? (
            <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>
          ) : model.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <ShiftSkeleton key={idx} />
              ))}
            </div>
          ) : venueItems.length === 0 ? (
            <div className="flex flex-col items-center">
              <EmptyState
                message={venueEmptyContent.title}
                description={venueEmptyContent.description}
                illustration={<EmptyInboxIllustration className="h-24 w-24" />}
              />
              <Button variant="gradient" size="lg" className="mt-2 px-6" onClick={handleOpenCreate}>
                {t('feed.venueEmptyCta')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {venueItems.map(shift => (
                <PersonalShiftCard
                  key={shift.id}
                  shift={shift}
                  onEdit={model.handleEdit}
                  onDelete={model.handleDelete}
                  isDeleting={model.isDeleting}
                />
              ))}
            </div>
          )}
        </PullToRefresh>
      </div>
    </>
  )
}

interface EmployeeActivityContentProps {
  t: TFunction
  model: ActivityPageModel
}

const EmployeeActivityContent = ({ t, model }: EmployeeActivityContentProps) => {
  return (
    <>
      <ActivityHeader activeTab={model.activeTab} onChange={model.setActiveTab} />

      <div className="p-4">
        {model.activeTab === 'list' ? (
          <div className="space-y-4">
            <ActivityListTab
              isLoading={model.isLoading}
              isAppliedLoading={model.isAppliedLoading}
              isError={model.isError}
              shifts={model.shifts}
              appliedShifts={model.appliedShifts}
              isDeleting={model.isDeleting}
              onEdit={model.handleEdit}
              onDelete={model.handleDelete}
              showToast={model.showToast}
              onRefresh={model.refreshList}
            />
          </div>
        ) : (
          <ActivityCalendarTab
            isLoading={model.isLoading}
            isError={model.isError}
            weekDays={model.weekDays}
            groupedShifts={model.groupedShiftsForCalendar}
            selectedDayKey={model.selectedDayKey}
            onSelectDay={model.setSelectedDayKey}
            selectedDayShifts={model.selectedDayShiftsForCalendar}
            onEdit={model.handleEdit}
            onDelete={model.handleDelete}
            isDeleting={model.isDeleting}
            showToast={model.showToast}
            onFindShift={model.handleFindShift}
          />
        )}
      </div>

      <AddShiftDrawer
        open={model.isDrawerOpen}
        onOpenChange={open => {
          model.setIsDrawerOpen(open)
          if (!open) model.setEditingShift(null)
        }}
        initialValues={model.editingShift}
        onSave={() => {
          model.setIsDrawerOpen(false)
          model.setEditingShift(null)
          model.showToast(t('shift.saved'), 'success')
        }}
      />
    </>
  )
}

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
          defaultValue: 'Создайте первую вакансию — кандидаты начнут откликаться, и вы увидите их здесь.',
        }),
      }
    }

    return {
      title: t('venueUi.activityEmpty.noShiftsTitle', {
        defaultValue: 'У вас пока нет смен',
      }),
      description: t('venueUi.activityEmpty.noShiftsDescription', {
        defaultValue: 'Создайте первую смену — кандидаты начнут откликаться, и вы увидите их здесь.',
      }),
    }
  }, [hasAnyVenueItems, t, venueTab])

  useEffect(() => {
    if (!isVenue) return
    const type = venueTab === 'vacancies' ? 'vacancy' : 'replacement'
    window.dispatchEvent(new CustomEvent('setVenueCreateType', { detail: { type } }))
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

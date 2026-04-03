import type { TFunction } from 'i18next'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { Tabs, type TabOption } from '@/components/ui/tabs'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { Button } from '@/components/ui/button'
import { PersonalShiftCard } from './PersonalShiftCard'
import type { useActivityPageModel } from '../../model/hooks/useActivityPageModel'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

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

export const VenueActivityContent = ({
  t,
  model,
  venueTab,
  setVenueTab,
  venueTabOptions,
  venueItems,
  venueEmptyContent,
}: VenueActivityContentProps) => {
  const handleOpenCreate = () => emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)

  return (
    <>
      <div className="top-0 z-10 bg-background/95 backdrop-blur-sm transition-all border-border/50 ui-density-page ui-density-py-sm">
        <Tabs options={venueTabOptions} activeId={venueTab} onChange={setVenueTab} />
      </div>

      <div className="ui-density-page ui-density-py">
        <PullToRefresh onRefresh={model.refreshList} disabled={model.isLoading}>
          {model.isError ? (
            <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>
          ) : model.isLoading ? (
            <div className="ui-density-stack">
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
            <div className="ui-density-stack">
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

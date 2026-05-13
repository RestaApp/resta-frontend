import type { TFunction } from 'i18next'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { Tabs, type TabOption } from '@/components/ui/tabs'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { ErrorState } from '@/components/ui/states'
import { Button } from '@/components/ui/button'
import { Z_INDEX } from '@/shared/ui/zIndex'
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
  const selectedRole = useAppSelector(selectSelectedRole)
  const roleTheme = getRoleTheme(selectedRole ?? 'employee')

  return (
    <>
      <div
        className="top-0 bg-background/95 backdrop-blur-sm transition-all border-border/50 ui-density-page ui-density-py-sm"
        style={{ zIndex: Z_INDEX.stickyHeader }}
      >
        <Tabs
          options={venueTabOptions}
          activeId={venueTab}
          onChange={setVenueTab}
          activeIndicatorClassName={cn('shadow-sm', roleTheme.classes.bg)}
          activeTriggerClassName={roleTheme.classes.textOn}
        />
      </div>

      <div className="ui-density-page ui-density-py">
        <PullToRefresh onRefresh={model.refreshList} disabled={model.isLoading}>
          {model.isError ? (
            <ErrorState
              title={t('feed.loadErrorShifts')}
              onRetry={model.refreshList}
              retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
            />
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

import type { TFunction } from 'i18next'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/states'
import { Button } from '@/components/ui/button'
import { SuccessOverlay } from '@/components/ui/success-overlay'
import { VenueShiftsSection } from './VenueShiftsSection'
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
  venueItems: ActivityPageModel['shifts']
  venueEmptyContent: VenueEmptyContent
}

export const VenueActivityContent = ({
  t,
  model,
  venueTab,
  venueItems,
  venueEmptyContent,
}: VenueActivityContentProps) => {
  const handleOpenCreate = () => emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_ADD_SHIFT)
  return (
    <>
      <div className="ui-density-page ui-density-py">
        <PullToRefresh onRefresh={model.refreshList} disabled={model.isLoading}>
          {model.isError ? (
            <ErrorState
              title={t('feed.loadErrorShifts')}
              onRetry={model.refreshList}
              retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
            />
          ) : model.isLoading ? (
            <FeedCardSkeletonList />
          ) : venueItems.length === 0 ? (
            <EmptyState
              image={venueTab === 'vacancies' ? 'applications' : 'shifts'}
              message={venueEmptyContent.title}
              description={venueEmptyContent.description}
              action={
                <Button variant="gradient" size="md" className="px-6" onClick={handleOpenCreate}>
                  {t('feed.venueEmptyCta')}
                </Button>
              }
            />
          ) : (
            <VenueShiftsSection
              items={venueItems}
              onEdit={model.handleEdit}
              onDelete={model.handleDelete}
              isDeleting={model.isDeleting}
            />
          )}
        </PullToRefresh>
      </div>

      <SuccessOverlay state={model.successState} onClose={model.closeSuccess} />
    </>
  )
}

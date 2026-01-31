import { FeedHeader } from './components/FeedHeader'
import { FeedHotOffersSection } from './components/FeedHotOffersSection'
import { FeedBody } from './components/FeedBody'
import { useFeedPageModel } from '../model/hooks/useFeedPageModel'

export const FeedPage = () => {
    const m = useFeedPageModel()

    return (
        <div className=" bg-background">
            <FeedHeader
                options={m.feedTypeOptions}
                feedType={m.feedType}
                onChangeFeedType={m.setFeedType}
                onOpenFilters={m.openFilters}
                isLoading={m.isFetching}
                hasActiveFilters={m.hasActiveAdvancedFilters}
                activeFiltersList={m.activeFiltersList}
            />

            <FeedHotOffersSection
                hotOffers={m.hotOffers}
                totalCount={m.hotOffersTotalCount}
                onShowAll={m.showAllHotShifts}
                onItemClick={m.onHotOfferClick}
            />

            <FeedBody
                feedType={m.feedType}
                quickFilter={m.quickFilter}
                advancedFilters={m.advancedFilters}
                filteredShifts={m.filteredShifts}
                activeList={m.activeList}
                onOpenDetails={m.openShiftDetails}
                getApplicationId={m.getApplicationId}
                getApplicationStatus={m.getApplicationStatus}
                isApplied={m.isApplied}
                onApply={m.handleApply}
                onApplyWithModal={m.handleApplyWithModal}
                onCancel={m.handleCancel}
                isShiftLoading={m.isShiftLoading}
                selectedShiftId={m.selectedShiftId}
                selectedShift={m.selectedShift}
                selectedVacancy={m.selectedVacancy}
                onCloseDetails={m.closeShiftDetails}
                toast={m.toast}
                hideToast={m.hideToast}
                onResetFilters={m.resetFilters}
                profileAlert={m.profileAlert}
                onCloseProfileAlert={m.closeProfileAlert}
                onOpenProfileEdit={m.openProfileEdit}
                isFiltersOpen={m.isFiltersOpen}
                onCloseFilters={m.closeFilters}
                onApplyAdvancedFilters={m.applyAdvancedFilters}
                filteredCount={m.filteredCount}
                onResetFeedFilters={m.resetFeedFilters}
                isVacancy={m.isVacancy}
            />
        </div>
    )
}
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Toast } from '@/components/ui/toast'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { ShiftCard } from '@/components/ui/ShiftCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger'
import { ShiftDetailsScreen } from '@/components/ui/ShiftDetailsScreen'
import { AdvancedFilters, type AdvancedFiltersData } from './AdvancedFilters'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { ToastType } from '@/components/ui/toast'
import type { ShiftStatus } from '@/components/ui/StatusPill'

import type { FeedType, Shift } from '../../model/types'
import type { UseVacanciesInfiniteListReturn } from '../../model/hooks/useVacanciesInfiniteList'

type ProfileAlertState = {
    open: boolean
    message: string
    missingFields: string[]
}

type Props = {
    feedType: FeedType
    quickFilter: string
    advancedFilters: AdvancedFiltersData | null

    filteredShifts: Shift[]
    activeList: UseVacanciesInfiniteListReturn

    onOpenDetails: (id: number) => void

    getApplicationId: (id: number) => number | undefined
    getApplicationStatus: (id: number) => ShiftStatus
    isApplied: (id: number) => boolean

    onApply: (id: number) => Promise<void>
    onApplyWithModal: (id: number) => Promise<void>
    onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
    isShiftLoading: (id: number) => boolean

    // details
    selectedShiftId: number | null
    selectedShift: Shift | null
    selectedVacancy: VacancyApiItem | null
    onCloseDetails: () => void

    // toast
    toast: { message: string; type: ToastType; isVisible: boolean }
    hideToast: () => void

    // empty/reset
    onResetFilters: () => void

    // profile alert
    profileAlert: ProfileAlertState
    onCloseProfileAlert: () => void
    onOpenProfileEdit: () => void

    // advanced filters modal
    isFiltersOpen: boolean
    onCloseFilters: () => void
    onApplyAdvancedFilters: (f: AdvancedFiltersData | null) => void
    filteredCount: number
    onResetFeedFilters: () => void
    isVacancy: boolean
}

export const FeedBody = memo((props: Props) => {
    const {
        feedType,
        quickFilter,
        advancedFilters,
        filteredShifts,
        activeList,

        onOpenDetails,
        getApplicationId,
        getApplicationStatus,
        isApplied,
        onApply,
        onApplyWithModal,
        onCancel,
        isShiftLoading,

        selectedShiftId,
        selectedShift,
        selectedVacancy,
        onCloseDetails,

        toast,
        hideToast,

        onResetFilters,

        profileAlert,
        onCloseProfileAlert,
        onOpenProfileEdit,

        isFiltersOpen,
        onCloseFilters,
        onApplyAdvancedFilters,
        filteredCount,
        onResetFeedFilters,
        isVacancy,
    } = props

    const { t } = useTranslation()
    const hasActiveFilters = quickFilter !== 'all' || !!advancedFilters
    const isEmpty = filteredShifts.length === 0
    const showEmptyState =
        isEmpty && (activeList.totalCount === 0 || (!activeList.isFetching && activeList.totalCount !== -1))
    const showLoadingAfterEmpty = isEmpty && activeList.isFetching

    const emptyMessage = hasActiveFilters
        ? t('feed.emptyByFilters')
        : feedType === 'shifts'
            ? t('feed.noShifts')
            : t('feed.noVacancies')

    return (
        <>
            <div className="space-y-4 px-4 py-4">
                {activeList.isInitialLoading ? (
                    <div className="space-y-4">
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                    </div>
                ) : activeList.error ? (
                    <div className="py-8 text-center text-destructive">
                        {feedType === 'shifts' ? t('feed.loadErrorShifts') : t('feed.loadErrorVacancies')}
                    </div>
                ) : showEmptyState ? (
                    <EmptyState
                        message={emptyMessage}
                        onReset={onResetFilters}
                        showResetButton={hasActiveFilters}
                    />
                ) : showLoadingAfterEmpty ? (
                    <div className="space-y-4">
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                    </div>
                ) : (
                    <>
                        {filteredShifts.map((shift, index) => (
                            <motion.div
                                key={shift.id}
                                initial={index < 6 ? { y: 16, opacity: 0 } : false}
                                animate={index < 6 ? { y: 0, opacity: 1 } : undefined}
                                transition={index < 6 ? { delay: 0.15 + index * 0.04 } : undefined}
                            >
                                <ShiftCard
                                    shift={shift}
                                    applicationId={getApplicationId(shift.id) ?? null}
                                    applicationStatus={getApplicationStatus(shift.id) ?? null}
                                    isApplied={isApplied(shift.id)}
                                    onOpenDetails={onOpenDetails}
                                    onApply={onApplyWithModal}
                                    onCancel={onCancel}
                                    isLoading={isShiftLoading(shift.id)}
                                />
                            </motion.div>
                        ))}

                        {filteredShifts.length > 0 ? (
                            <InfiniteScrollTrigger
                                onLoadMore={activeList.loadMore}
                                hasMore={activeList.hasMore}
                                isLoading={activeList.isFetching}
                                isError={!!activeList.error}
                            />
                        ) : null}
                    </>
                )}
            </div>

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

            {selectedShiftId ? (
                <ShiftDetailsScreen
                    shift={selectedShift}
                    vacancyData={selectedVacancy}
                    applicationId={getApplicationId(selectedShiftId) ?? null}
                    isOpen={!!selectedShiftId}
                    onClose={onCloseDetails}
                    onApply={onApply}
                    onCancel={onCancel}
                    isApplied={isApplied(selectedShiftId)}
                    isLoading={isShiftLoading(selectedShiftId)}
                />
            ) : null}

            <AlertDialog open={profileAlert.open} onOpenChange={(open) => { if (!open) onCloseProfileAlert() }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('feed.applicationNotSent')}</AlertDialogTitle>
                    </AlertDialogHeader>

                    <AlertDialogDescription>
                        {profileAlert.message}
                    </AlertDialogDescription>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCloseProfileAlert}>{t('common.close')}</AlertDialogCancel>
                        <AlertDialogAction onClick={onOpenProfileEdit}>{t('common.openProfile')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AdvancedFilters
                isOpen={isFiltersOpen}
                onClose={onCloseFilters}
                onApply={onApplyAdvancedFilters}
                initialFilters={advancedFilters || undefined}
                filteredCount={filteredCount}
                onReset={onResetFeedFilters}
                isVacancy={isVacancy}
            />
        </>
    )
})
FeedBody.displayName = 'FeedBody'
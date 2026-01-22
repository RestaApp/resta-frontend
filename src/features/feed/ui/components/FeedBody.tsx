import { memo } from 'react'
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
    getApplicationStatus: (id: number) => any
    isApplied: (id: number) => boolean

    onApply: (id: number) => Promise<void>
    onApplyWithModal: (id: number) => Promise<void>
    onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
    isShiftLoading: (id: number) => boolean

    // details
    selectedShiftId: number | null
    selectedShift: Shift | null
    selectedVacancy: any | null
    onCloseDetails: () => void

    // toast
    toast: { message: string; type: any; isVisible: boolean }
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

    return (
        <>
            <div className="space-y-4 px-4 py-4">
                {activeList.isInitialLoading ? (
                    <>
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                    </>
                ) : activeList.error ? (
                    <div className="py-8 text-center text-destructive">
                        Ошибка загрузки {feedType === 'shifts' ? 'смен' : 'вакансий'}
                    </div>
                ) : filteredShifts.length === 0 &&
                    (activeList.totalCount === 0 || (!activeList.isFetching && activeList.totalCount !== -1)) ? (
                    <EmptyState
                        message={
                            quickFilter !== 'all' || advancedFilters
                                ? 'По вашим фильтрам ничего не найдено'
                                : feedType === 'shifts'
                                    ? 'Смены не найдены'
                                    : 'Вакансии не найдены'
                        }
                        onReset={onResetFilters}
                        showResetButton={!!(quickFilter !== 'all' || advancedFilters)}
                    />
                ) : filteredShifts.length === 0 && activeList.isFetching ? (
                    <>
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                        <ShiftSkeleton />
                    </>
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

            <AlertDialog open={profileAlert.open} onOpenChange={(o) => (!o ? onCloseProfileAlert() : undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ошибка профиля</AlertDialogTitle>
                    </AlertDialogHeader>

                    <AlertDialogDescription>
                        {profileAlert.message}
                        {profileAlert.missingFields.length ? (
                            <span className="block mt-2 text-xs text-muted-foreground">
                                missing_fields: {profileAlert.missingFields.join(', ')}
                            </span>
                        ) : null}
                    </AlertDialogDescription>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCloseProfileAlert}>Закрыть</AlertDialogCancel>
                        <AlertDialogAction onClick={onOpenProfileEdit}>Открыть профиль</AlertDialogAction>
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
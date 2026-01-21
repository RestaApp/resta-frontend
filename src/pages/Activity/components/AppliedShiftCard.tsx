import React, { useMemo, useState, useCallback } from 'react'
import { ShiftCard } from '@/features/feed/ui/components/ShiftCard'
import { ShiftDetailsScreen } from '@/features/feed/ui/components/ShiftDetailsScreen'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { mapVacancyToCardShift } from '@/features/feed/model/utils/mapping'

interface AppliedShiftCardProps {
    shift: VacancyApiItem
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const AppliedShiftCard: React.FC<AppliedShiftCardProps> = ({ shift, showToast }) => {
    const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()
    const [isOpen, setIsOpen] = useState(false)

    const mappedShift = useMemo(() => mapVacancyToCardShift(shift), [shift])
    const applicationId = mappedShift.applicationId ?? null

    const handleOpenDetails = useCallback((_id: number) => setIsOpen(true), [])
    const handleCloseDetails = useCallback(() => setIsOpen(false), [])

    const handleCancel = useCallback(async (appId?: number | null) => {
        if (!appId) return
        try {
            await cancelApplication(appId).unwrap()
            showToast('Заявка отменена', 'success')
        } catch {
            showToast('Не удалось отменить заявку', 'error')
        }
    }, [cancelApplication, showToast])

    const handleCancelFromDetails = useCallback(async (appId: number | null | undefined) => {
        await handleCancel(appId ?? applicationId)
        setIsOpen(false)
    }, [handleCancel, applicationId])

    const handleApplyFromDetails = useCallback(async () => {
        showToast('Отклик пока недоступен в этом экране', 'info')
        setIsOpen(false)
    }, [showToast])

    return (
        <>
            <ShiftCard
                shift={mappedShift}
                isApplied={!!applicationId}
                applicationId={applicationId}
                applicationStatus={mappedShift.applicationStatus ?? null}
                onOpenDetails={handleOpenDetails}
                onApply={() => { }}
                onCancel={(appId) => handleCancel(appId ?? applicationId)}
                isLoading={isCancelling}
                variant="iconActions"
            />

            <ShiftDetailsScreen
                shift={mappedShift}
                vacancyData={shift}
                applicationId={applicationId}
                isOpen={isOpen}
                onClose={handleCloseDetails}
                onApply={handleApplyFromDetails}
                isApplied={!!applicationId}
                onCancel={(appId) => handleCancelFromDetails(appId)}
                isLoading={isCancelling}
            />
        </>
    )
}

AppliedShiftCard.displayName = 'AppliedShiftCard'

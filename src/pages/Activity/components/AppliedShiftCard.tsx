import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Users } from 'lucide-react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { formatTime } from '@/utils/datetime'
import { getEmployeePositionLabel } from '@/constants/labels'
import { useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { ActionButton } from '@/components/ui/ActionButton'

interface AppliedShiftCardProps {
    shift: VacancyApiItem
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const AppliedShiftCard: React.FC<AppliedShiftCardProps> = ({ shift, showToast }) => {
    const pay = shift.payment ?? shift.hourly_rate ?? null
    const timeText = formatTime(shift.start_time, shift.end_time)
    const restaurant = shift.user?.name || shift.user?.full_name || 'Ресторан'
    const appStatus = shift.my_application?.status
    const status = appStatus ?? shift.status
    const isPending = appStatus === 'pending' || appStatus === 'processing'
    const isAccepted = appStatus === 'accepted'
    const isRejected = appStatus === 'rejected'
    const applicationId = shift.my_application?.id
    const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()

    const handleRoute = () => {
        showToast('Маршрут скопирован', 'success')
    }

    const handleFindReplacement = () => {
        showToast('Ищем замену...', 'info')
    }

    return (
        <Card className="p-4">
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="px-2 py-1 text-xs rounded-full"
                                style={{
                                    background: isAccepted ? 'var(--blue-cyber)' : isRejected ? 'var(--destructive)' : 'linear-gradient(90deg,#7c3aed,#ec4899)',
                                    color: isAccepted || isRejected ? 'white' : 'inherit',
                                }}
                            >
                                {isAccepted ? 'Подтверждено' : isRejected ? 'Отклонено' : isPending ? 'В обработке' : (status ?? '')}
                            </span>
                        </div>
                        <h4 className="mb-1 font-semibold">{restaurant}</h4>
                        <p className="text-sm text-muted-foreground">{getEmployeePositionLabel(shift.position || '')}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl mb-1">{pay} <span className="text-sm font-normal text-muted-foreground">BYN</span></div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{timeText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{shift.location || shift.user?.restaurant_profile?.city || 'Адрес не указан'}</span>
                    </div>
                </div>

                {applicationId && isPending ? (
                    <div className="pt-2">
                        <ActionButton
                            isLoading={isCancelling}
                            active
                            onClick={async () => {
                                try {
                                    await cancelApplication(applicationId as number).unwrap()
                                    showToast('Заявка отменена', 'success')
                                } catch {
                                    showToast('Не удалось отменить заявку', 'error')
                                }
                            }}
                            className="w-full flex items-center justify-center"
                        >
                            {isCancelling ? 'Отмена...' : 'Отменить заявку'}
                        </ActionButton>
                    </div>
                ) : isAccepted ? (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button onClick={handleRoute} variant="outline" className="flex items-center justify-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Маршрут
                        </Button>
                        <Button onClick={handleFindReplacement} variant="default" className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            Замена
                        </Button>
                    </div>
                ) : isRejected ? (
                    <div className="pt-2">
                        <div className="text-sm text-muted-foreground">Заявка отклонена</div>
                    </div>
                ) : null}
            </div>
        </Card>
    )
}

AppliedShiftCard.displayName = 'AppliedShiftCard'


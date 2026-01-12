import React, { useCallback } from 'react'
import { Clock, Edit2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ActionButton } from '@/components/ui/ActionButton'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { cn } from '@/utils/cn'
import { formatDate, formatTime } from '@/utils/datetime'

interface PersonalShiftCardProps {
    shift: VacancyApiItem
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    isDeleting?: boolean
}

export const PersonalShiftCard: React.FC<PersonalShiftCardProps> = ({ shift, onEdit, onDelete, isDeleting }) => {
    const handleEdit = useCallback(() => {
        onEdit(shift.id)
    }, [onEdit, shift.id])

    const handleDelete = useCallback(() => {
        onDelete(shift.id)
    }, [onDelete, shift.id])

    const dateText = formatDate(shift.start_time)
    const timeText = formatTime(shift.start_time, shift.end_time)

    const pay = shift.payment ?? shift.hourly_rate ?? null

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={cn('w-3 h-3 rounded-full', shift.urgent ? 'bg-amber-500' : 'bg-primary')} />
                        <span className="text-xs text-muted-foreground">Моя смена</span>
                    </div>

                    <h4 className="mb-1 font-semibold text-base">📝 {shift.title || 'Без названия'}</h4>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <div>
                                <div>{dateText}</div>
                                <div className="text-[13px]">{timeText}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {pay && (
                    <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-lg font-semibold">{pay} <span className="text-sm font-normal text-muted-foreground">BYN</span></div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
                <ActionButton onClick={handleEdit} className="flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Изменить
                </ActionButton>
                <ActionButton isLoading={!!isDeleting} active onClick={handleDelete} className="flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Удаляем...' : 'Удалить'}
                </ActionButton>
            </div>
        </Card>
    )
}

PersonalShiftCard.displayName = 'PersonalShiftCard'


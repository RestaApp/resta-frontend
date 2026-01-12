import { useMemo, useState, useCallback } from 'react'
import { CalendarDays, List } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import { useGetMyShiftsQuery } from '@/services/api/shiftsApi'
import { PersonalShiftCard } from './components/PersonalShiftCard'
import AddShiftDrawer from './components/AddShiftDrawer'
import { AppliedShiftCard } from './components/AppliedShiftCard'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { useDeleteShift } from '@/hooks/useShifts'
import { useToast } from '@/hooks/useToast'
import { ShiftSkeleton } from '@/components/ui/ShiftSkeleton'
import { EmptyState } from '@/pages/Feed/components/EmptyState'

type ActivityTab = 'list' | 'calendar'
export const ActivityPage = () => {
    const [activeTab, setActiveTab] = useState<ActivityTab>('list')

    const { data, isLoading, isError } = useGetMyShiftsQuery()
    const shifts = Array.isArray(data) ? data : (data && (data as any).data ? (data as any).data : [])
    const { data: appliedData } = useGetAppliedShiftsQuery()
    const appliedShifts = Array.isArray(appliedData) ? appliedData : (appliedData && (appliedData as any).data ? (appliedData as any).data : [])
    const { deleteShift, isLoading: isDeleting } = useDeleteShift()
    const { showToast } = useToast()

    const handleEdit = useCallback((id: number) => {
        const found = shifts.find((s: any) => s.id === id) || null
        setEditingShift(found)
        setIsDrawerOpen(true)
    }, [shifts])
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingShift, setEditingShift] = useState<any | null>(null)

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteShift(String(id))
            showToast('Смена удалена', 'success')
        } catch {
            showToast('Не удалось удалить смену', 'error')
        }
    }, [deleteShift, showToast])

    const tabOptions = useMemo<TabOption<ActivityTab>[]>(() => [
        { id: 'list', label: 'Список', icon: List },
        { id: 'calendar', label: 'Календарь', icon: CalendarDays },
    ], [])



    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={tabOptions} activeId={activeTab} onChange={setActiveTab} />
                </div>
            </div>

            <div className="p-4">
                <div className="text-sm text-muted-foreground mb-3">Найдено смен: {shifts.length}</div>

                {activeTab === 'list' && (
                    <div className="space-y-4">
                        {isLoading ? (
                            <ShiftSkeleton />
                        ) : isError ? (
                            <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>
                        ) : shifts.length === 0 ? (
                            <EmptyState message="Смены не найдены" />
                        ) : (
                            <div className="space-y-3">
                                {shifts.map((shift: any) => (
                                    <PersonalShiftCard
                                        key={shift.id}
                                        shift={shift}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isDeleting={isDeleting}
                                    />
                                ))}

                                {appliedShifts.length > 0 && (
                                    <>
                                        <div className="text-sm text-muted-foreground mt-4 mb-2">Мои отклики</div>
                                        <div className="space-y-4">
                                            {appliedShifts.map((shift: any) => (
                                                <AppliedShiftCard key={shift.id} shift={shift} showToast={(m, t) => showToast(m, t as any)} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="text-muted-foreground">Календарь пока не реализован</div>
                )}
            </div>

            <AddShiftDrawer
                open={isDrawerOpen}
                onOpenChange={(open) => {
                    setIsDrawerOpen(open)
                    if (!open) setEditingShift(null)
                }}
                initialValues={editingShift}
                onSave={(res) => {
                    setIsDrawerOpen(false)
                    setEditingShift(null)
                    if (res) {
                        showToast('Смена сохранена', 'success')
                    }
                }}
            />

        </div>
    )
}

import { useMemo, useState, useCallback, useEffect } from 'react'
import { CalendarDays, List, Calendar, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import { useGetMyShiftsQuery } from '@/services/api/shiftsApi'
import { PersonalShiftCard } from './components/PersonalShiftCard'
import AddShiftDrawer from './components/AddShiftDrawer'
import { AppliedShiftCard } from './components/AppliedShiftCard'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { useDeleteShift } from '@/hooks/useShifts'
import { useToast } from '@/hooks/useToast'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/pages/Feed/components/EmptyState'
import { Card } from '@/components/ui/card'
import { parseDate } from '@/utils/datetime'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

type ActivityTab = 'list' | 'calendar'
export const ActivityPage = () => {
    const [activeTab, setActiveTab] = useState<ActivityTab>('list')

    const { data, isLoading, isError } = useGetMyShiftsQuery()
    const shifts = Array.isArray(data) ? data : (data && (data as any).data ? (data as any).data : [])
    const { data: appliedData, isLoading: isAppliedLoading } = useGetAppliedShiftsQuery()
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

    // Логика для календаря
    const [selectedDay, setSelectedDay] = useState<string>('')

    // Получаем неделю с днями
    const weekDays = useMemo(() => {
        const today = new Date()
        const days: Array<{ date: string; short: string; full: string; dateObj: Date }> = []

        // Начинаем с понедельника текущей недели
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Понедельник = 1
        const monday = new Date(today)
        monday.setDate(today.getDate() + diff)

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)

            const dayNum = date.getDate()
            const shortDay = date.toLocaleDateString('ru-RU', { weekday: 'short' })
            const fullDay = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

            days.push({
                date: String(dayNum).padStart(2, '0'),
                short: shortDay.charAt(0).toUpperCase() + shortDay.slice(1),
                full: fullDay,
                dateObj: date,
            })
        }

        return days
    }, [])

    // Устанавливаем выбранный день по умолчанию на сегодня при первой загрузке
    useEffect(() => {
        if (!selectedDay && weekDays.length > 0) {
            const today = new Date()
            const todayDay = String(today.getDate()).padStart(2, '0')
            // Проверяем, что сегодняшний день есть в неделе
            const todayInWeek = weekDays.find((d) => d.date === todayDay)
            if (todayInWeek) {
                setSelectedDay(todayDay)
            } else {
                // Если сегодняшний день не в текущей неделе, выбираем первый день
                setSelectedDay(weekDays[0].date)
            }
        }
    }, [selectedDay, weekDays])

    // Группируем все смены (личные + отклики) по датам
    const groupedShifts = useMemo(() => {
        const grouped: Record<string, Array<{ id: number; type: 'resta' | 'personal'; data: any }>> = {}

        // Добавляем личные смены
        shifts.forEach((shift: any) => {
            if (!shift.start_time) return
            const date = parseDate(shift.start_time)
            if (!date) return

            const dateKey = date.toISOString().split('T')[0]
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push({
                id: shift.id,
                type: 'personal',
                data: shift,
            })
        })

        // Добавляем отклики
        appliedShifts.forEach((shift: any) => {
            if (!shift.start_time) return
            const date = parseDate(shift.start_time)
            if (!date) return

            const dateKey = date.toISOString().split('T')[0]
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push({
                id: shift.id,
                type: 'resta',
                data: shift,
            })
        })

        return grouped
    }, [shifts, appliedShifts])

    // Получаем смены для выбранного дня
    const selectedDayShifts = useMemo(() => {
        const selectedDayObj = weekDays.find((d) => d.date === selectedDay)
        if (!selectedDayObj) return []

        const dateKey = selectedDayObj.dateObj.toISOString().split('T')[0]
        return groupedShifts[dateKey] || []
    }, [selectedDay, weekDays, groupedShifts])



    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={tabOptions} activeId={activeTab} onChange={setActiveTab} />
                </div>
            </div>

            <div className="p-4">
                {activeTab === 'list' && (
                    <div className="space-y-4">
                        {(isLoading || isAppliedLoading) ? (
                            <ShiftSkeleton />
                        ) : isError ? (
                            <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>
                        ) : shifts.length === 0 && appliedShifts.length === 0 ? (
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
                                        {shifts.length > 0 && (
                                            <div className="text-sm text-muted-foreground mt-4 mb-2">Мои отклики</div>
                                        )}
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
                    <div className="space-y-4">
                        {isLoading ? (
                            <ShiftSkeleton />
                        ) : isError ? (
                            <div className="text-center py-8 text-destructive">Ошибка загрузки смен</div>
                        ) : (
                            <>
                                {/* Дни недели */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {weekDays.map((day) => {
                                        const dateKey = day.dateObj.toISOString().split('T')[0]
                                        const hasShifts = groupedShifts[dateKey]?.length > 0
                                        const isSelected = selectedDay === day.date

                                        return (
                                            <button
                                                key={day.date}
                                                onClick={() => setSelectedDay(day.date)}
                                                className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[60px] transition-all relative"
                                                style={{
                                                    background: isSelected
                                                        ? 'var(--gradient-primary)'
                                                        : 'var(--muted)',
                                                    color: isSelected ? 'white' : 'inherit',
                                                }}
                                            >
                                                <span className="text-xs mb-1">{day.short}</span>
                                                <span className="text-lg font-medium">{day.date}</span>
                                                {hasShifts && !isSelected && (
                                                    <span
                                                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                                        style={{ background: 'var(--primary)' }}
                                                    />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Смены выбранного дня */}
                                <div>
                                    <h4 className="mb-3 text-lg font-semibold">
                                        {weekDays.find((d) => d.date === selectedDay)?.full || 'День'}
                                    </h4>
                                    {selectedDayShifts.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDayShifts.map((shift) =>
                                                shift.type === 'resta' ? (
                                                    <AppliedShiftCard
                                                        key={shift.id}
                                                        shift={shift.data}
                                                        showToast={(m, t) => showToast(m, t as any)}
                                                    />
                                                ) : (
                                                    <PersonalShiftCard
                                                        key={shift.id}
                                                        shift={shift.data}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        isDeleting={isDeleting}
                                                    />
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <Card>
                                            <div className="text-center py-8 px-4">
                                                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                                <p className="text-muted-foreground mb-4">Свободный день!</p>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    className="px-6 py-2 rounded-xl border-2 flex items-center gap-2 mx-auto"
                                                    style={{ borderColor: 'var(--border)' }}
                                                    onClick={() => {
                                                        // Устанавливаем флаг для перехода на Feed с вкладкой смен
                                                        setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS, 'true')
                                                        // Отправляем событие для переключения таба
                                                        window.dispatchEvent(new CustomEvent('navigateToFeedShifts'))
                                                    }}
                                                >
                                                    <Search className="w-4 h-4" />
                                                    Найти смену
                                                </motion.button>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
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

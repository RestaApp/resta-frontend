import { useMemo, useState } from 'react'
import { CalendarDays, List } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import type { TabOption } from '@/components/ui/tabs'
import { useGetShiftsQuery } from '@/services/api/shiftsApi'

type ActivityTab = 'list' | 'calendar'
export const ActivityPage = () => {
    const [activeTab, setActiveTab] = useState<ActivityTab>('list')

    const { data: shifts = [], isLoading, isError } = useGetShiftsQuery({})

    const tabOptions = useMemo<TabOption<ActivityTab>[]>(() => [
        { id: 'list', label: 'Список', icon: List },
        { id: 'calendar', label: 'Календарь', icon: CalendarDays },
    ], [])



    if (isLoading) return <div className="p-4">Загрузка смен...</div>
    if (isError) return <div className="p-4 text-red-500">Ошибка загрузки смен</div>

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 transition-all border-border/50">
                <div className="px-4 pb-2">
                    <Tabs options={tabOptions} activeId={activeTab} onChange={setActiveTab} />
                </div>
            </div>

            <div className="p-4">
                <div className="text-sm text-muted-foreground">Найдено смен: {shifts.length}</div>
            </div>

        </div>
    )
}

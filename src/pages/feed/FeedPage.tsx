import { useState } from 'react'
import { motion } from 'motion/react'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useToast } from '../../hooks/useToast'
import { Tabs } from '../../components/ui/tabs'
import { SearchFilters } from './components/SearchFilters'
import { HotOffers } from './components/HotOffers'
import { ShiftCard } from './components/ShiftCard'
import { JobCard } from './components/JobCard'
import { MapFAB } from './components/MapFAB'
import { Toast } from '../../components/ui/toast'
import type { FeedType } from './types'
import type { Shift, Job } from './types'
import type { TabOption } from '../../components/ui/tabs'
import type { JSX } from 'react'

const hotShifts = [
    { id: 1, restaurant: 'Sunset', emoji: '🌅', boost: 'x1.5', time: 'Сегодня вечер' },
    { id: 2, restaurant: 'Культура', emoji: '🍹', boost: 'x2.0', time: 'Срочно!' },
    { id: 3, restaurant: 'Лаванда', emoji: '🌸', boost: 'x1.3', time: 'Завтра утро' },
    { id: 4, restaurant: 'Хлеб', emoji: '🥖', boost: 'x1.5', time: 'Сегодня ночь' },
]

const shifts: Shift[] = [
    {
        id: 1,
        logo: '🌅',
        restaurant: 'Ресторан "Sunset"',
        rating: 4.8,
        position: 'Повар-универсал',
        date: '25 декабря',
        time: '10:00 - 22:00',
        pay: 160,
        currency: 'BYN',
    },
    {
        id: 2,
        logo: '🌸',
        restaurant: 'Кафе "Лаванда"',
        rating: 4.9,
        position: 'Официант',
        date: '26 декабря',
        time: '14:00 - 22:00',
        pay: 120,
        currency: 'BYN',
    },
    {
        id: 3,
        logo: '🍹',
        restaurant: 'Бар "Культура"',
        rating: 4.7,
        position: 'Бармен',
        date: '27 декабря',
        time: '18:00 - 02:00',
        pay: 140,
        currency: 'BYN',
    },
]

const jobs: Job[] = [
    {
        id: 1,
        logo: '🍕',
        restaurant: 'Pizzeria Napoli',
        rating: 4.6,
        position: 'Пиццайоло',
        schedule: '5/2',
        salary: 'от 2500',
        currency: 'BYN',
    },
    {
        id: 2,
        logo: '☕️',
        restaurant: 'Coffee House',
        rating: 4.8,
        position: 'Бариста',
        schedule: '2/2',
        salary: 'от 2000',
        currency: 'BYN',
    },
]

export const FeedPage = (): JSX.Element => {
    useUserProfile()
    const { toast, showToast, hideToast } = useToast()
    const [feedType, setFeedType] = useState<FeedType>('shifts')
    const [query, setQuery] = useState('')
    const [appliedShifts, setAppliedShifts] = useState<number[]>([])
    const [showMapFAB] = useState(true)

    const feedTypeOptions: TabOption<FeedType>[] = [
        { id: 'shifts', label: '🔥 Смены' },
        { id: 'jobs', label: '💼 Вакансии' },
    ]

    const handleApply = (shiftId: number) => {
        if (navigator.vibrate) {
            navigator.vibrate(50)
        }
        setAppliedShifts(prev => [...prev, shiftId])
        showToast('✅ Заявка отправлена! Если вас утвердят, бот пришлет сообщение.', 'success')
    }

    const handleContact = (restaurant: string) => {
        showToast(`Открытие Telegram-чата с менеджером "${restaurant}"`, 'info')
    }

    const handleOpenMap = () => {
        showToast('🗺 Открытие карты с метками смен', 'info')
    }

    return (
        <div className="min-h-screen bg-background pb-20">

            <div className="px-4 mt-4">
                <Tabs options={feedTypeOptions} activeId={feedType} onChange={setFeedType} />
            </div>

            <SearchFilters query={query} onQueryChange={setQuery} />

            {feedType === 'shifts' && <HotOffers items={hotShifts} />}

            <div className="px-4 py-4 space-y-4">
                {feedType === 'shifts'
                    ? shifts
                        .filter(s => s.restaurant.toLowerCase().includes(query.toLowerCase()) || s.position.toLowerCase().includes(query.toLowerCase()))
                        .map((shift, index) => (
                            <motion.div key={shift.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + index * 0.05 }}>
                                <ShiftCard shift={shift} isApplied={appliedShifts.includes(shift.id)} onApply={handleApply} />
                            </motion.div>
                        ))
                    : jobs
                        .filter(j => j.restaurant.toLowerCase().includes(query.toLowerCase()) || j.position.toLowerCase().includes(query.toLowerCase()))
                        .map((job, index) => (
                            <motion.div key={job.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + index * 0.05 }}>
                                <JobCard job={job} onContact={handleContact} />
                            </motion.div>
                        ))}
            </div>

            {showMapFAB && <MapFAB onOpen={handleOpenMap} />}

            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
        </div>
    )
}



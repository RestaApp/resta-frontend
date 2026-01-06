import { useState } from 'react'
import { Clock, Calendar, DollarSign } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription } from '../../../components/ui/drawer'
import { Input } from '@/components/ui/input'

export interface PersonalShift {
    id: string
    title: string
    date: string
    startTime: string
    endTime: string
    pay?: number
    color: 'work' | 'personal' | 'rest'
    type: 'personal'
}

const colorOptions = [
    { value: 'work', label: '💼 Работа', color: '#8B5CF6' },
    { value: 'personal', label: '📝 Личное', color: '#06B6D4' },
    { value: 'rest', label: '🌴 Отдых', color: '#10B981' },
] as const

type AddShiftDrawerProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (shift: PersonalShift) => void
}

export const AddShiftDrawer = ({ open, onOpenChange, onSave }: AddShiftDrawerProps) => {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [pay, setPay] = useState('')
    const [selectedColor, setSelectedColor] = useState<'work' | 'personal' | 'rest'>('work')

    const close = () => onOpenChange(false)

    const handleSave = () => {
        if (!title || !date || !startTime || !endTime) return

        const newShift: PersonalShift = {
            id: Date.now().toString(),
            title,
            date,
            startTime,
            endTime,
            pay: pay ? parseFloat(pay) : undefined,
            color: selectedColor,
            type: 'personal',
        }

        onSave?.(newShift)
        // reset
        setTitle('')
        setDate('')
        setStartTime('')
        setEndTime('')
        setPay('')
        setSelectedColor('work')
        close()
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerHeader>
                <DrawerTitle>Добавить смену</DrawerTitle>
                <DrawerDescription>Создайте личную смену — она отобразится только у вас.</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 p-4">
                <div>
                    <label className="block mb-2 text-sm text-muted-foreground">Название смены</label>
                    <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder='Например: "Основная работа", "Банкет"' />
                </div>

                <div>
                    <label className="block mb-2 text-sm text-muted-foreground">Дата</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="pl-11" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm text-muted-foreground">Начало</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input type="time" value={startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)} className="pl-11" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-muted-foreground">Конец</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input type="time" value={endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)} className="pl-11" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block mb-2 text-sm text-muted-foreground">Оплата <span className="text-xs">(необязательно)</span></label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input type="number" value={pay} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPay(e.target.value)} placeholder="Сколько платят?" className="pl-11" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Укажите оплату, чтобы видеть прогноз заработка за месяц</p>
                </div>

                <div>
                    <label className="block mb-3 text-sm text-muted-foreground">Категория</label>
                    <div className="grid grid-cols-3 gap-3">
                        {colorOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedColor(option.value as any)}
                                className="p-3 rounded-xl border-2 transition-all text-sm"
                                style={{
                                    background: selectedColor === option.value ? `${option.color}20` : 'transparent',
                                    borderColor: selectedColor === option.value ? option.color : 'var(--border)',
                                }}
                                type="button"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <DrawerFooter>
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={close} className="py-3 rounded-xl border-2" style={{ borderColor: 'var(--border)' }}>
                        Отмена
                    </button>
                    <button onClick={handleSave} disabled={!title || !date || !startTime || !endTime} style={{ background: 'var(--gradient-primary)' }} className="py-3 rounded-xl text-white disabled:opacity-50">
                        Сохранить
                    </button>
                </div>
            </DrawerFooter>
        </Drawer>
    )
}

export default AddShiftDrawer



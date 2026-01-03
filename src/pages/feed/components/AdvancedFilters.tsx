import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useCallback } from 'react'
 

export interface AdvancedFiltersData {
    priceRange: [number, number]
    selectedRoles: string[]
    timeOfDay: string[]
}

interface AdvancedFiltersProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: AdvancedFiltersData) => void
    initialFilters?: AdvancedFiltersData
}

const ROLES = ['Повар', 'Су-шеф', 'Бармен', 'Официант', 'Бариста', 'Мойщик', 'Админ']

const TIMES = [
    { id: 'morning', label: '🌅 Утро', desc: 'до 12:00' },
    { id: 'day', label: '☀️ День', desc: '12:00 - 18:00' },
    { id: 'evening', label: '🌆 Вечер', desc: 'после 18:00' },
    { id: 'night', label: '🌙 Ночь', desc: 'смены в ночь' },
]

export const AdvancedFilters = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
}: AdvancedFiltersProps) => {
    const [priceRange, setPriceRange] = useState<[number, number]>(
        initialFilters?.priceRange || [50, 500]
    )
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        initialFilters?.selectedRoles || []
    )
    const [timeOfDay, setTimeOfDay] = useState<string[]>(initialFilters?.timeOfDay || [])

    const toggleRole = useCallback((role: string) => {
        setSelectedRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]))
    }, [])

    const toggleTime = useCallback((time: string) => {
        setTimeOfDay(prev => (prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]))
    }, [])

    const handleReset = useCallback(() => {
        setPriceRange([0, 1000])
        setSelectedRoles([])
        setTimeOfDay([])
    }, [])

    const handleApply = useCallback(() => {
        onApply({ priceRange, selectedRoles, timeOfDay })
        onClose()
    }, [priceRange, selectedRoles, timeOfDay, onApply, onClose])

    const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (value <= priceRange[1]) {
            setPriceRange([value, priceRange[1]])
        }
    }, [priceRange])

    const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (value >= priceRange[0]) {
            setPriceRange([priceRange[0], value])
        }
    }, [priceRange])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[24px] z-50 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-muted rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-5 py-3 flex items-center justify-between border-b border-border/50">
                            <h2 className="text-xl font-bold">Фильтры</h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Закрыть"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-5 space-y-8 pb-24">
                            {/* 1. Бюджет (Range Slider) */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-base">Ставка за смену</h3>
                                    <span className="text-primary font-bold text-sm">
                                        {priceRange[0]} - {priceRange[1]} BYN
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative h-6 flex items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1000"
                                            value={priceRange[0]}
                                            onChange={handleMinPriceChange}
                                            className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="relative h-6 flex items-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1000"
                                            value={priceRange[1]}
                                            onChange={handleMaxPriceChange}
                                            className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>0 BYN</span>
                                    <span>1000+ BYN</span>
                                </div>
                            </div>

                            {/* 2. Время суток (Grid) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-base">Время начала</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {TIMES.map((time) => {
                                        const isSelected = timeOfDay.includes(time.id)
                                        return (
                                            <button
                                                key={time.id}
                                                onClick={() => toggleTime(time.id)}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                                                    ${isSelected
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-border bg-secondary/30'
                                                    }
                                                `}
                                            >
                                                <div
                                                    className={`
                                                    w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                                                    ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                                                `}
                                                >
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{time.label}</div>
                                                    <div className="text-[10px] text-muted-foreground">{time.desc}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 3. Специализация (Tags) */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-base">Специализация</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map((role) => {
                                        const isSelected = selectedRoles.includes(role)
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => toggleRole(role)}
                                                className={`
                                                    px-4 py-2 rounded-xl text-sm font-medium transition-colors border
                                                    ${isSelected
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'bg-card text-foreground border-border hover:border-foreground/50'
                                                    }
                                                `}
                                            >
                                                {role}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border/50 safe-area-bottom">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-3.5 rounded-xl font-semibold text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                                >
                                    Сбросить
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all"
                                >
                                    Применить
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}


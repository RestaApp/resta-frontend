/**
 * Переиспользуемые поля формы для сотрудника
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import type { JSX } from 'react'

interface ExperienceFieldProps {
    value: number
    onChange: (value: number) => void
    withAnimation?: boolean
    animationDelay?: number
}

export const ExperienceField = memo(function ExperienceField({
    value,
    onChange,
    withAnimation = false,
    animationDelay = 0,
}: ExperienceFieldProps): JSX.Element {
    const getYearsLabel = (years: number): string => {
        if (years === 1) return 'год'
        if (years < 5) return 'года'
        return 'лет'
    }

    const getValueText = (): string => {
        if (value === 0) return 'Без опыта'
        if (value === 5) return '5+ лет'
        return `${value} ${getYearsLabel(value)}`
    }

    const content = (
        <div>
            <label className="block mb-1 text-muted-foreground text-sm font-medium">
                Ваш стаж
            </label>
            <div className="mb-3">
                <span className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
                    {getValueText()}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    onTouchStart={e => {
                        e.stopPropagation()
                    }}
                    onTouchMove={e => {
                        e.stopPropagation()
                    }}
                    onTouchEnd={e => {
                        e.stopPropagation()
                    }}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer relative"
                    style={{
                        accentColor: 'var(--primary)',
                        touchAction: 'none',
                        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(value / 5) * 100}%, #E0E0E0 ${(value / 5) * 100}%, #E0E0E0 100%)`,
                    }}
                />
                {/* Засечки */}
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none" style={{ top: '-2px' }}>
                    {[0, 1, 2, 3, 4, 5].map(tick => (
                        <div
                            key={tick}
                            className="w-1 h-1.5 rounded-full"
                            style={{
                                backgroundColor: value >= tick ? 'var(--primary)' : '#E0E0E0',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )

    if (withAnimation) {
        return (
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: animationDelay }}
            >
                {content}
            </motion.div>
        )
    }

    return <div>{content}</div>
})

interface OpenToWorkToggleProps {
    value: boolean
    onChange: (value: boolean) => void
    withAnimation?: boolean
    animationDelay?: number
}

export const OpenToWorkToggle = memo(function OpenToWorkToggle({
    value,
    onChange,
    withAnimation = false,
    animationDelay = 0,
}: OpenToWorkToggleProps): JSX.Element {
    const content = (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-foreground">В активном поиске</span>
            <button
                onClick={() => onChange(!value)}
                className={cn(
                    'w-14 h-8 rounded-full transition-colors relative',
                    value ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                aria-label={value ? 'Отключить поиск работы' : 'Включить поиск работы'}
            >
                <div
                    className={cn(
                        'absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm',
                        value ? 'translate-x-7' : 'translate-x-1'
                    )}
                />
            </button>
        </div>
    )

    if (withAnimation) {
        return (
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: animationDelay }}
            >
                {content}
            </motion.div>
        )
    }

    return content
})

interface LocationFieldProps {
    value: string
    onChange: (value: string) => void
    onLocationRequest: () => void
    withAnimation?: boolean
    animationDelay?: number
    isLoading?: boolean
}

export const LocationField = memo(function LocationField({
    value,
    onChange,
    onLocationRequest,
    withAnimation = false,
    animationDelay = 0,
    isLoading = false,
}: LocationFieldProps): JSX.Element {
    const content = (
        <div>
            <label className="block mb-2 text-muted-foreground text-sm font-medium">
                Город
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Минск"
                    className="w-full px-4 py-3 pr-12 rounded-2xl border border-[#E0E0E0] bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm text-foreground"
                />
                <button
                    onClick={onLocationRequest}
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Определить местоположение"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                    )}
                </button>
            </div>
        </div>
    )

    if (withAnimation) {
        return (
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: animationDelay }}
            >
                {content}
            </motion.div>
        )
    }

    return <div>{content}</div>
})


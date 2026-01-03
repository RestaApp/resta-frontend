/**
 * Переиспользуемые поля формы для сотрудника
 */

import { memo } from 'react'
import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { cn } from '../../../../../utils/cn'
import { RangeSlider } from '../../../../../components/ui'


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
}: ExperienceFieldProps) {
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
            <label className="block mb-1 text-muted-foreground text-sm font-medium">Ваш стаж</label>
            <div className="mb-3">
                <span className="text-lg font-semibold text-gradient">
                    {getValueText()}
                </span>
            </div>
            <RangeSlider
                min={0}
                max={5}
                step={1}
                value={value}
                onChange={onChange}
                showTicks={true}
                tickCount={5}
            />
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
}: OpenToWorkToggleProps) {
    const content = (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl">
            <span className="text-sm font-medium text-foreground">В активном поиске</span>
            <button
                onClick={() => onChange(!value)}
                className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
                    value ? 'focus:ring-purple-500/50' : 'focus:ring-muted-foreground/50'
                )}
                style={{
                    background: value
                        ? 'var(--gradient-primary)'
                        : 'var(--switch-background)',
                }}
                aria-label={value ? 'Отключить поиск работы' : 'Включить поиск работы'}
            >
                <motion.div
                    className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
                    animate={{
                        x: value ? 28 : 2,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                    }}
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
}: LocationFieldProps) {
    const content = (
        <div>
            <label className="block mb-2 text-muted-foreground text-sm font-medium">Город</label>
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

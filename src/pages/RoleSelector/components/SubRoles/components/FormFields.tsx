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

    const content = (
        <>
            <label className={`block ${withAnimation ? 'mb-3' : 'mb-2'} text-foreground font-medium text-sm`}>
                Опыт работы: {value === 0 ? 'Без опыта' : value === 5 ? '5+' : `${value} ${getYearsLabel(value)}`}
            </label>
            <input
                type="range"
                min="0"
                max="5"
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                    accentColor: 'var(--primary)',
                    touchAction: 'none',
                }}
            />
            <div className={`flex justify-between ${withAnimation ? 'mt-2' : 'mt-1'} text-muted-foreground text-xs`}>
                <span>Без опыта</span>
                <span>5+ лет</span>
            </div>
        </>
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
            <span className="text-sm font-medium text-foreground">Ищу работу прямо сейчас</span>
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
                        'absolute top-1 w-6 h-6 bg-white rounded-full transition-transform',
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
        <>
            <label className={`block ${withAnimation ? 'mb-2' : 'mb-2'} text-foreground font-medium text-sm`}>
                Город
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Минск"
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                />
                <button
                    onClick={onLocationRequest}
                    disabled={isLoading}
                    className="px-4 py-3 rounded-2xl border-2 border-border hover:border-primary/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Определить местоположение"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
            </div>
        </>
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


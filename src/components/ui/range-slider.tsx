import { memo, useCallback, useEffect, useState } from 'react'
import { motion, useSpring, useMotionValueEvent, useTransform } from 'motion/react'
import { cn } from '@/utils/cn'

interface RangeSliderProps {
    /** Минимальное значение */
    min: number
    /** Максимальное значение */
    max: number
    /** Текущее значение (для single mode) */
    value?: number
    /** Диапазон значений [min, max] (для range mode) */
    range?: [number, number]
    /** Callback при изменении значения (для single mode) */
    onChange?: (value: number) => void
    /** Callback при изменении диапазона (для range mode) */
    onRangeChange?: (range: [number, number]) => void
    /** Шаг изменения значения */
    step?: number
    /** Класс для контейнера */
    className?: string
    /** Показывать ли засечки (ticks) */
    showTicks?: boolean
    /** Количество засечек (если showTicks=true) */
    tickCount?: number
}

/**
 * Универсальный компонент слайдера для выбора значения или диапазона.
 * Поддерживает два режима:
 * - Single mode: выбор одного значения (value + onChange)
 * - Range mode: выбор диапазона (range + onRangeChange)
 */
export const RangeSlider = memo(function RangeSlider({
    min,
    max,
    value,
    range,
    onChange,
    onRangeChange,
    step = 1,
    className,
    showTicks = false,
    tickCount,
}: RangeSliderProps) {
    const isRangeMode = range !== undefined && onRangeChange !== undefined

    // Single mode
    const singleValue = value ?? min
    const singleSpring = useSpring(singleValue, {
        stiffness: 220,
        damping: 18,
        mass: 0.35,
    })
    const [animatedSingleValue, setAnimatedSingleValue] = useState(singleValue)

    useEffect(() => {
        singleSpring.set(singleValue)
    }, [singleValue, singleSpring])

    useMotionValueEvent(singleSpring, 'change', latest => {
        setAnimatedSingleValue(Math.round(latest))
    })

    // Range mode
    const [rangeMin, rangeMax] = range ?? [min, max]
    const minSpring = useSpring(rangeMin, {
        stiffness: 220,
        damping: 18,
        mass: 0.35,
    })
    const maxSpring = useSpring(rangeMax, {
        stiffness: 220,
        damping: 18,
        mass: 0.35,
    })
    const [animatedMin, setAnimatedMin] = useState(rangeMin)
    const [animatedMax, setAnimatedMax] = useState(rangeMax)

    useEffect(() => {
        minSpring.set(rangeMin)
        maxSpring.set(rangeMax)
    }, [rangeMin, rangeMax, minSpring, maxSpring])

    useMotionValueEvent(minSpring, 'change', latest => {
        setAnimatedMin(Math.round(latest))
    })
    useMotionValueEvent(maxSpring, 'change', latest => {
        setAnimatedMax(Math.round(latest))
    })

    const handleSingleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = Number(e.target.value)
            onChange?.(newValue)
        },
        [onChange]
    )

    const handleMinChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMin = Number(e.target.value)
            // Ограничиваем, чтобы min не превышал max
            const clampedMin = Math.min(newMin, rangeMax)
            onRangeChange?.([clampedMin, rangeMax])
        },
        [rangeMax, onRangeChange]
    )

    const handleMaxChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMax = Number(e.target.value)
            // Ограничиваем, чтобы max не был меньше min
            const clampedMax = Math.max(newMax, rangeMin)
            onRangeChange?.([rangeMin, clampedMax])
        },
        [rangeMin, onRangeChange]
    )

    const ticks = showTicks
        ? Array.from({ length: (tickCount ?? max - min) + 1 }, (_, i) => min + i * ((max - min) / (tickCount ?? max - min)))
        : []

    if (isRangeMode) {
        return (
            <div
                className={cn('relative', className)}
                style={{ height: '6px' }}
            >
                {/* Фон слайдера */}
                <div className="w-full h-1.5 bg-[#E0E0E0] dark:bg-white/20 rounded-full relative overflow-visible">
                    {/* Активный диапазон */}
                    <motion.div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                            left: useTransform(minSpring, v => `${((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100}%`),
                            width: useTransform(
                                [minSpring, maxSpring],
                                (values: number[]) => {
                                    const [minVal, maxVal] = values
                                    const minPct = ((Math.max(min, Math.min(max, minVal)) - min) / (max - min)) * 100
                                    const maxPct = ((Math.max(min, Math.min(max, maxVal)) - min) / (max - min)) * 100
                                    return `${maxPct - minPct}%`
                                }
                            ),
                            background: 'var(--gradient-primary)',
                        }}
                    />
                </div>

                {/* Визуальный бегунок для min */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20"
                    style={{
                        left: useTransform(minSpring, v => {
                            const percentage = ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100
                            return `calc(${percentage}% - 8px)`
                        }),
                        background: 'var(--gradient-primary)',
                    }}
                />

                {/* Визуальный бегунок для max */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20"
                    style={{
                        left: useTransform(maxSpring, v => {
                            const percentage = ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100
                            return `calc(${percentage}% - 8px)`
                        }),
                        background: 'var(--gradient-primary)',
                    }}
                />

                {/* Input для min - нижний слой, ограничен max */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={rangeMin}
                    onChange={handleMinChange}
                    className="range-slider-input absolute top-0 left-0 w-full h-6 opacity-0 z-20"
                    style={{
                        touchAction: 'none',
                    }}
                />

                {/* Input для max - верхний слой, ограничен min */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={rangeMax}
                    onChange={handleMaxChange}
                    className="range-slider-input absolute top-0 left-0 w-full h-6 opacity-0 z-20"
                    style={{
                        touchAction: 'none',
                    }}
                />

                {/* Засечки */}
                {showTicks && ticks.length > 0 && (
                    <div
                        className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none"
                        style={{ top: '-2px' }}
                    >
                        {ticks.map((tick, index) => (
                            <motion.div
                                key={index}
                                className="w-1 h-1.5 rounded-full"
                                animate={{
                                    background:
                                        animatedMin <= tick && tick <= animatedMax
                                            ? 'var(--gradient-primary)'
                                            : '#E0E0E0',
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Single mode
    return (
        <div className={cn('relative', className)} style={{ height: '6px' }}>
            {/* Фон слайдера */}
            <div className="w-full h-1.5 bg-[#E0E0E0] dark:bg-white/20 rounded-full relative overflow-visible">
                <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                        width: useTransform(singleSpring, v => `${((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100}%`),
                        background: 'var(--gradient-primary)',
                    }}
                />
            </div>

            {/* Визуальный бегунок */}
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20"
                style={{
                    left: useTransform(singleSpring, v => {
                        const percentage = ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100
                        return `calc(${percentage}% - 8px)`
                    }),
                    background: 'var(--gradient-primary)',
                }}
            />

            {/* Input для управления */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={singleValue}
                onChange={handleSingleChange}
                onTouchStart={e => e.stopPropagation()}
                onTouchMove={e => e.stopPropagation()}
                onTouchEnd={e => e.stopPropagation()}
                className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
                style={{ touchAction: 'none' }}
            />

            {/* Засечки */}
            {showTicks && ticks.length > 0 && (
                <div
                    className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none"
                    style={{ top: '-2px' }}
                >
                    {ticks.map((tick, index) => (
                        <motion.div
                            key={index}
                            className="w-1 h-1.5 rounded-full"
                            animate={{
                                background:
                                    animatedSingleValue >= tick ? 'var(--gradient-primary)' : '#E0E0E0',
                            }}
                            transition={{
                                duration: 0.3,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
})


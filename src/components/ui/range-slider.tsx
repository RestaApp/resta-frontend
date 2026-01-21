import { memo, useCallback, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { cn } from '@/utils/cn'

interface RangeSliderProps {
    min: number
    max: number
    value?: number
    range?: [number, number]
    onChange?: (value: number) => void
    onRangeChange?: (range: [number, number]) => void
    step?: number
    className?: string
    showTicks?: boolean
    tickCount?: number // рекомендуй <= 20
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const toNumber = (v: unknown) => (typeof v === 'number' ? v : Number(v))

const buildTicks = (min: number, max: number, count: number) => {
    const safe = Math.max(2, Math.min(21, count))
    const step = (max - min) / (safe - 1)
    return Array.from({ length: safe }, (_, i) => min + i * step)
}

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
    tickCount = 11,
}: RangeSliderProps) {
    const isRangeMode = range !== undefined && onRangeChange !== undefined

    const ticks = useMemo(
        () => (showTicks ? buildTicks(min, max, tickCount) : []),
        [showTicks, min, max, tickCount]
    )

    if (isRangeMode) {
        const [rMin, rMax] = range
        const minSpring = useSpring(clamp(rMin, min, max), { stiffness: 220, damping: 18, mass: 0.35 })
        const maxSpring = useSpring(clamp(rMax, min, max), { stiffness: 220, damping: 18, mass: 0.35 })

        const leftPct = useTransform(minSpring, (v) => {
            const n = clamp(toNumber(v), min, max)
            return `${((n - min) / (max - min)) * 100}%`
        })

        const widthPct = useTransform([minSpring, maxSpring], ([a, b]) => {
            const minVal = clamp(toNumber(a), min, max)
            const maxVal = clamp(toNumber(b), min, max)
            const minPct = ((minVal - min) / (max - min)) * 100
            const maxPct = ((maxVal - min) / (max - min)) * 100
            return `${Math.max(0, maxPct - minPct)}%`
        })

        const minThumbLeft = useTransform(minSpring, (v) => {
            const n = clamp(toNumber(v), min, max)
            const pct = ((n - min) / (max - min)) * 100
            return `calc(${pct}% - 8px)`
        })

        const maxThumbLeft = useTransform(maxSpring, (v) => {
            const n = clamp(toNumber(v), min, max)
            const pct = ((n - min) / (max - min)) * 100
            return `calc(${pct}% - 8px)`
        })

        const handleMin = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const nextMin = Number(e.target.value)
                onRangeChange([Math.min(nextMin, rMax), rMax])
            },
            [onRangeChange, rMax]
        )

        const handleMax = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const nextMax = Number(e.target.value)
                onRangeChange([rMin, Math.max(nextMax, rMin)])
            },
            [onRangeChange, rMin]
        )

        return (
            <div className={cn('relative', className)} style={{ height: 6 }}>
                <div className="relative h-1.5 w-full rounded-full bg-[#E0E0E0] dark:bg-white/20">
                    <motion.div
                        className="absolute top-0 h-full rounded-full"
                        style={{
                            left: leftPct,
                            width: widthPct,
                            background: 'var(--gradient-primary)',
                        }}
                    />
                </div>

                <motion.div
                    className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full shadow-lg"
                    style={{ left: minThumbLeft, background: 'var(--gradient-primary)' }}
                />
                <motion.div
                    className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full shadow-lg"
                    style={{ left: maxThumbLeft, background: 'var(--gradient-primary)' }}
                />

                {/* Нижний слой */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={rMin}
                    onChange={handleMin}
                    className="absolute left-0 top-0 z-10 h-6 w-full cursor-pointer opacity-0"
                    style={{ touchAction: 'none' }}
                />
                {/* Верхний слой */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={rMax}
                    onChange={handleMax}
                    className="absolute left-0 top-0 z-20 h-6 w-full cursor-pointer opacity-0"
                    style={{ touchAction: 'none' }}
                />

                {showTicks && ticks.length > 0 && (
                    <div className="pointer-events-none absolute left-0 right-0 flex justify-between" style={{ top: -2 }}>
                        {ticks.map((t, i) => {
                            const active = rMin <= t && t <= rMax
                            return (
                                <div
                                    key={i}
                                    className="h-1.5 w-1 rounded-full"
                                    style={{ background: active ? 'var(--gradient-primary)' : '#E0E0E0' }}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    // Single mode
    const v = value ?? min
    const spring = useSpring(clamp(v, min, max), { stiffness: 220, damping: 18, mass: 0.35 })

    const widthPct = useTransform(spring, (x) => {
        const n = clamp(toNumber(x), min, max)
        return `${((n - min) / (max - min)) * 100}%`
    })

    const thumbLeft = useTransform(spring, (x) => {
        const n = clamp(toNumber(x), min, max)
        const pct = ((n - min) / (max - min)) * 100
        return `calc(${pct}% - 8px)`
    })

    const handleSingle = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(Number(e.target.value)),
        [onChange]
    )

    return (
        <div className={cn('relative', className)} style={{ height: 6 }}>
            <div className="relative h-1.5 w-full rounded-full bg-[#E0E0E0] dark:bg-white/20">
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: widthPct, background: 'var(--gradient-primary)' }}
                />
            </div>

            <motion.div
                className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full shadow-lg"
                style={{ left: thumbLeft, background: 'var(--gradient-primary)' }}
            />

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={v}
                onChange={handleSingle}
                className="absolute left-0 top-0 z-10 h-6 w-full cursor-pointer opacity-0"
                style={{ touchAction: 'none' }}
            />

            {showTicks && ticks.length > 0 && (
                <div className="pointer-events-none absolute left-0 right-0 flex justify-between" style={{ top: -2 }}>
                    {ticks.map((t, i) => {
                        const active = v >= t
                        return (
                            <div
                                key={i}
                                className="h-1.5 w-1 rounded-full"
                                style={{ background: active ? 'var(--gradient-primary)' : '#E0E0E0' }}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
})
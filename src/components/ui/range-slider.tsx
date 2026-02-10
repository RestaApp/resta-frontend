import { memo, useCallback, useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValueEvent } from 'motion/react'
import { cn } from '@/utils/cn'

const SPRING_CONFIG = { stiffness: 220, damping: 18, mass: 0.35 }
const DEFAULT_TICK_COUNT = 10
const MAX_TICK_COUNT = 20

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

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
  tickCount?: number
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
  tickCount,
}: RangeSliderProps) {
  const isRangeMode = range !== undefined && onRangeChange !== undefined

  const singleValue = value ?? min
  const singleSpring = useSpring(singleValue, SPRING_CONFIG)

  const [rangeMin, rangeMax] = range ?? [min, max]
  const minSpring = useSpring(rangeMin, SPRING_CONFIG)
  const maxSpring = useSpring(rangeMax, SPRING_CONFIG)

  useEffect(() => {
    singleSpring.set(singleValue)
  }, [singleValue, singleSpring])

  const [animatedMin, setAnimatedMin] = useState(rangeMin)
  const [animatedMax, setAnimatedMax] = useState(rangeMax)
  useMotionValueEvent(minSpring, 'change', (latest) => setAnimatedMin(latest))
  useMotionValueEvent(maxSpring, 'change', (latest) => setAnimatedMax(latest))

  useEffect(() => {
    minSpring.set(rangeMin)
    maxSpring.set(rangeMax)
  }, [rangeMin, rangeMax, minSpring, maxSpring])

  const span = Math.max(1, max - min)
  const toPct = (v: number) => `${((clamp(v, min, max) - min) / span) * 100}%`
  const singleWidth = useTransform(singleSpring, toPct)
  const singleThumbLeft = useTransform(singleSpring, (v) => `calc(${((clamp(v, min, max) - min) / span) * 100}% - 8px)`)

  const rangeLeft = useTransform(minSpring, toPct)
  const rangeWidth = useTransform(
    [minSpring, maxSpring],
    ([a, b]: number[]) => {
      const minPct = (clamp(a, min, max) - min) / span
      const maxPct = (clamp(b, min, max) - min) / span
      return `${(maxPct - minPct) * 100}%`
    }
  )
  const minThumbLeft = useTransform(minSpring, (v) => `calc(${((clamp(v, min, max) - min) / span) * 100}% - 8px)`)
  const maxThumbLeft = useTransform(maxSpring, (v) => `calc(${((clamp(v, min, max) - min) / span) * 100}% - 8px)`)

  const effectiveTickCount = Math.min(tickCount ?? DEFAULT_TICK_COUNT, MAX_TICK_COUNT)
  const ticks = showTicks
    ? Array.from({ length: effectiveTickCount + 1 }, (_, i) => min + (i * (max - min)) / effectiveTickCount)
    : []

  const handleSingleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(Number(e.target.value)),
    [onChange]
  )

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), rangeMax)
      onRangeChange?.([newMin, rangeMax])
    },
    [rangeMax, onRangeChange]
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), rangeMin)
      onRangeChange?.([rangeMin, newMax])
    },
    [rangeMin, onRangeChange]
  )

  const trackBg = 'bg-muted'
  const tickInactive = 'bg-muted'

  if (isRangeMode) {
    return (
      <div className={cn('relative', className)} style={{ height: '6px' }}>
        <div className={cn('w-full h-1.5 rounded-full relative overflow-visible', trackBg)}>
          <motion.div
            className="absolute top-0 h-full rounded-full gradient-primary"
            style={{ left: rangeLeft, width: rangeWidth }}
          />
        </div>

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20 gradient-primary"
          style={{ left: minThumbLeft }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20 gradient-primary"
          style={{ left: maxThumbLeft }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeMin}
          onChange={handleMinChange}
          className="range-slider-input absolute top-1/2 -translate-y-1/2 h-10 opacity-0 cursor-pointer z-20"
          style={{ touchAction: 'none', left: '-8px', width: 'calc(100% + 16px)' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeMax}
          onChange={handleMaxChange}
          className="range-slider-input absolute top-1/2 -translate-y-1/2 h-10 opacity-0 cursor-pointer z-20"
          style={{ touchAction: 'none', left: '-8px', width: 'calc(100% + 16px)' }}
        />

        {showTicks && ticks.length > 0 && (
          <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none" style={{ top: '-2px' }}>
            {ticks.map((tick, index) => (
              <div
                key={index}
                className={cn(
                  'w-1 h-1.5 rounded-full transition-colors duration-300',
                  animatedMin <= tick && tick <= animatedMax ? 'gradient-primary' : tickInactive
                )}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} style={{ height: '6px' }}>
      <div className={cn('w-full h-1.5 rounded-full relative overflow-visible', trackBg)}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full gradient-primary"
          style={{ width: singleWidth }}
        />
      </div>

      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg pointer-events-none z-20 gradient-primary"
        style={{ left: singleThumbLeft }}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={singleValue}
        onChange={handleSingleChange}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute top-1/2 -translate-y-1/2 h-10 opacity-0 cursor-pointer z-10"
        style={{ touchAction: 'none', left: '-8px', width: 'calc(100% + 16px)' }}
      />

      {showTicks && ticks.length > 0 && (
        <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none" style={{ top: '-2px' }}>
          {ticks.map((tick, index) => (
            <div
              key={index}
              className={cn(
                'w-1 h-1.5 rounded-full transition-colors duration-300',
                singleValue >= tick ? 'gradient-primary' : tickInactive
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
})

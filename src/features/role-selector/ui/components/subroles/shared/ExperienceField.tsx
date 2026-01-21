/**
 * Поле выбора опыта работы
 */

import { memo } from 'react'
import { RangeSlider } from '@/components/ui'
import { formatExperienceText } from '@/utils/experience'
import { AnimatedField } from './AnimatedField'

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
    const content = (
        <div>
            <label className="block mb-1 text-muted-foreground text-sm font-medium">
                Ваш стаж
            </label>
            <div className="mb-3">
                <span className="text-lg font-semibold text-gradient">
                    {formatExperienceText(value)}
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

    return (
        <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
            {content}
        </AnimatedField>
    )
})

/**
 * Поле выбора опыта работы
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RangeSlider } from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { formatExperienceText } from '@/utils/experience'
import { BLOCK_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/utils/cn'
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
  const { t } = useTranslation()
  const content = (
    <FormField label={t('roles.yourExperience')}>
      <div className="flex flex-col gap-3">
        <span className={cn(BLOCK_TITLE_CLASS, 'text-gradient')}>
          {formatExperienceText(value)}
        </span>
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
    </FormField>
  )

  return (
    <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
      {content}
    </AnimatedField>
  )
})

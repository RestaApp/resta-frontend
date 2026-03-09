/**
 * Поле выбора опыта работы
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RangeSlider } from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
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
  const { t } = useTranslation()
  const content = (
    <FormField label={t('roles.yourExperience')} labelClassName="mb-1">
      <div className="mb-3">
        <span className="text-lg font-semibold text-gradient">{formatExperienceText(value)}</span>
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
    </FormField>
  )

  return (
    <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
      {content}
    </AnimatedField>
  )
})

/**
 * Переключатель "В активном поиске"
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'
import { AnimatedField } from './AnimatedField'

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
  const { t } = useTranslation()
  const content = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl">
        <span className="text-sm font-medium text-foreground">{t('roles.openToWork')}</span>
        <Switch
          checked={value}
          onCheckedChange={onChange}
          ariaLabel={value ? t('roles.openToWorkAriaOff') : t('roles.openToWorkAriaOn')}
        />
      </div>
      <p className="text-xs text-muted-foreground px-0.5">{t('roles.openToWorkHint')}</p>
    </div>
  )

  return (
    <AnimatedField withAnimation={withAnimation} animationDelay={animationDelay}>
      {content}
    </AnimatedField>
  )
})

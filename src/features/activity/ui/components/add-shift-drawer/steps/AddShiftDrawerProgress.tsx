import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BODY_MUTED_CLASS } from '@/components/ui/ui-patterns'
import { SHIFT_CARD_TITLE_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import type { AddShiftDrawerProgressProps } from './types'

export const AddShiftDrawerProgress = ({
  step,
  totalSteps,
  stepTitle,
}: AddShiftDrawerProgressProps) => {
  const { t } = useTranslation()
  const progress = useMemo(() => `${((step + 1) / totalSteps) * 100}%`, [step, totalSteps])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <p className={BODY_MUTED_CLASS}>
          {t('shift.addStepLabel', { current: step + 1, total: totalSteps })}
        </p>
        <p className={SHIFT_CARD_TITLE_CLASS}>{stepTitle}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-secondary">
        <div
          className="h-1 rounded-full bg-primary transition-[width]"
          style={{ width: progress }}
        />
      </div>
    </div>
  )
}

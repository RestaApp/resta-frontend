import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AddShiftDrawerProgressProps } from './types'

export const AddShiftDrawerProgress = ({
  step,
  totalSteps,
  stepTitle,
}: AddShiftDrawerProgressProps) => {
  const { t } = useTranslation()
  const progress = useMemo(() => `${((step + 1) / totalSteps) * 100}%`, [step, totalSteps])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('shift.addStepLabel', { current: step + 1, total: totalSteps })}
        </p>
        <p className="text-sm font-medium">{stepTitle}</p>
      </div>
      <div className="h-1 w-full rounded-full bg-muted">
        <div
          className="h-1 rounded-full bg-primary transition-[width]"
          style={{ width: progress }}
        />
      </div>
    </div>
  )
}

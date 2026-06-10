import { memo, useEffect, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/shared/utils/cn'
import { META_MONO_CLASS } from '@/components/ui/ui-patterns'
import { resetAppScroll } from '@/shared/ui/appScroll'
import { StepPanel } from '@/components/ui/step-panel'
import { StepProgress } from '@/components/ui/step-progress'

interface OnboardingStepLayoutProps {
  title: ReactNode
  subtitle: ReactNode
  currentStep: number
  totalSteps: number
  children: ReactNode
  bottomSpace?: string
  /** i18n-ключ названия шага для индикатора «Step N of M · Name». */
  stepNameKey?: string
}

export const OnboardingStepLayout = memo(function OnboardingStepLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  bottomSpace,
  stepNameKey,
}: OnboardingStepLayoutProps) {
  useEffect(() => {
    resetAppScroll()
    const raf = requestAnimationFrame(() => resetAppScroll())
    return () => cancelAnimationFrame(raf)
  }, [currentStep])

  return (
    <div className="bg-background flex flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        progress={
          <StepProgress current={currentStep} total={totalSteps} stepNameKey={stepNameKey} />
        }
      />
      <div className={cn('ui-density-page pt-3', bottomSpace)}>
        <StepPanel stepKey={currentStep}>{children}</StepPanel>
      </div>
    </div>
  )
})

interface OnboardingSectionProps {
  label: ReactNode
  hint?: ReactNode
  children: ReactNode
  className?: string
}

export const OnboardingSection = memo(function OnboardingSection({
  label,
  hint,
  children,
  className,
}: OnboardingSectionProps) {
  return (
    <section className={cn('flex w-full max-w-md flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className={META_MONO_CLASS}>{label}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </section>
  )
})

import { memo, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/utils/cn'
import { META_MONO_CLASS } from '@/components/ui/ui-patterns'
import { OnboardingProgress } from './OnboardingProgress'

interface OnboardingStepLayoutProps {
  title: ReactNode
  subtitle: ReactNode
  currentStep: number
  totalSteps: number
  children: ReactNode
  bottomSpace?: string
  contentClassName?: string
}

export const OnboardingStepLayout = memo(function OnboardingStepLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  bottomSpace,
  contentClassName,
}: OnboardingStepLayoutProps) {
  return (
    <div className="bg-background flex flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        progress={<OnboardingProgress current={currentStep} total={totalSteps} />}
      />
      <div className={cn('ui-density-page pt-3', bottomSpace, contentClassName)}>{children}</div>
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
        {hint ? <div className="text-sm text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </section>
  )
})

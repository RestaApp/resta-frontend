import { memo, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/utils/cn'
import { OnboardingProgress } from './OnboardingProgress'
import type { RoleKind } from '@/shared/lib/role-theme'

type OnboardingTone = RoleKind | 'primary'

interface OnboardingStepLayoutProps {
  title: ReactNode
  subtitle: ReactNode
  currentStep: number
  totalSteps: number
  children: ReactNode
  tone?: OnboardingTone
  bottomSpace?: string
  scrollable?: boolean
  contentClassName?: string
}

export const OnboardingStepLayout = memo(function OnboardingStepLayout({
  title,
  subtitle,
  currentStep,
  totalSteps,
  children,
  tone = 'primary',
  bottomSpace,
  scrollable = true,
  contentClassName,
}: OnboardingStepLayoutProps) {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <PageHeader
        title={<span className="text-screen-title font-extrabold">{title}</span>}
        subtitle={<span className="text-body-lg">{subtitle}</span>}
        progress={
          <OnboardingProgress
            current={currentStep}
            total={totalSteps}
            tone={tone === 'primary' ? undefined : tone}
          />
        }
      />
      <div
        className={cn(
          'flex-1 flex flex-col ui-density-page',
          scrollable ? 'overflow-y-auto' : 'overflow-y-hidden',
          bottomSpace
        )}
      >
        <div className={cn('pt-3', contentClassName)}>{children}</div>
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
    <section className={cn('max-w-md w-full', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-mono-resta text-body-sm uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </div>
        {hint ? <div className="text-body-lg text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </section>
  )
})

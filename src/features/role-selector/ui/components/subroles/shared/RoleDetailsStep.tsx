import { memo, useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TagGroup } from '@/shared/ui/TagGroup'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import {
  OnboardingBottomCta,
  ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT,
} from '../../OnboardingBottomCta'
import { OnboardingSection, OnboardingStepLayout } from '../../OnboardingStepLayout'

export interface RoleDetailsGroup {
  id: string
  label: ReactNode
  hint?: ReactNode
  values: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
  getLabel: (value: string) => string
  getIcon?: (value: string) => LucideIcon | undefined
  getAriaLabel?: (value: string, label: string) => string
  emptyText?: ReactNode
  expandable?: boolean
}

interface RoleDetailsStepProps {
  title: ReactNode
  subtitle: ReactNode
  groups: RoleDetailsGroup[]
  ctaText: ReactNode
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
  isSubmitting?: boolean
  continueButtonAriaLabel?: string
  stepNameKey?: string
}

export const RoleDetailsStep = memo(function RoleDetailsStep({
  title,
  subtitle,
  groups,
  ctaText,
  onContinue,
  onBack,
  canContinue,
  isSubmitting = false,
  continueButtonAriaLabel,
  stepNameKey = 'onboarding.stepNames.profile',
}: RoleDetailsStepProps) {
  const onBackRef = useRef(onBack)
  useLayoutEffect(() => {
    onBackRef.current = onBack
  })
  const stableBack = useCallback(() => onBackRef.current(), [])

  useEffect(() => {
    return setupTelegramBackButton(stableBack)
  }, [stableBack])

  return (
    <OnboardingStepLayout
      currentStep={3}
      totalSteps={3}
      stepNameKey={stepNameKey}
      title={title}
      subtitle={subtitle}
      bottomSpace={ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT}
    >
      <div className="flex w-full max-w-md flex-col gap-4">
        {groups.map(group => (
          <OnboardingSection key={group.id} label={group.label} hint={group.hint}>
            {group.values.length > 0 ? (
              <TagGroup
                values={group.values}
                selectedValues={group.selectedValues}
                onToggle={group.onToggle}
                getLabel={group.getLabel}
                getIcon={group.getIcon}
                getAriaLabel={group.getAriaLabel}
                expandable={group.expandable}
                size="md"
              />
            ) : group.emptyText ? (
              <div className="text-sm text-muted-foreground">{group.emptyText}</div>
            ) : null}
          </OnboardingSection>
        ))}
      </div>

      <OnboardingBottomCta
        onClick={onContinue}
        loading={isSubmitting}
        disabled={!canContinue || isSubmitting}
        ariaLabel={continueButtonAriaLabel}
        showFillLaterHint
      >
        {ctaText}
      </OnboardingBottomCta>
    </OnboardingStepLayout>
  )
})

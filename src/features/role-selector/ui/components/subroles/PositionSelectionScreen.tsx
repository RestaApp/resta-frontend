/**
 * Экран выбора позиции сотрудника
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLabels } from '@/shared/i18n/hooks'
import { TagGroup } from '@/shared/ui/TagGroup'
import { OnboardingProgress } from '../OnboardingProgress'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT } from '../OnboardingBottomCta'
import type { EmployeeSubRole, EmployeeRole } from '@/shared/types/roles.types'

const EMOJI_BY_ROLE: Partial<Record<EmployeeRole, string>> = {
  chef: '👨‍🍳',
  waiter: '🍽',
  barista: '☕',
  bartender: '🍸',
  manager: '📋',
  support: '🎧',
  delivery: '🛵',
  cashier: '💵',
  office: '💼',
}

interface PositionSelectionScreenProps {
  subRoles: EmployeeSubRole[]
  selectedSubRole: string | null
  onPositionSelect: (role: EmployeeRole, positionValue: string) => void
  specializations: string[]
  selectedSpecializations: string[]
  onSpecializationToggle: (spec: string) => void
  onContinue: () => void
}

export const PositionSelectionScreen = memo(function PositionSelectionScreen({
  subRoles,
  selectedSubRole,
  onPositionSelect,
  specializations,
  selectedSpecializations,
  onSpecializationToggle,
  onContinue,
}: PositionSelectionScreenProps) {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [needsScroll, setNeedsScroll] = useState(false)
  const visibleRoles = subRoles

  const handleSelect = useCallback(
    (id: string) => {
      const role = subRoles.find(r => r.id === id)
      if (role) onPositionSelect(role.id, role.originalValue || role.id)
    },
    [subRoles, onPositionSelect]
  )

  useEffect(() => {
    const container = scrollContainerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const updateScrollState = () => {
      const ctaReserve = selectedSubRole ? 104 : 0
      const visibleHeight = container.clientHeight - ctaReserve
      setNeedsScroll(content.scrollHeight > visibleHeight + 1)
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(container)
    resizeObserver.observe(content)
    window.addEventListener('resize', updateScrollState)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScrollState)
    }
  }, [selectedSubRole, specializations.length, visibleRoles.length])

  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <div
        ref={scrollContainerRef}
        className={`flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] ${
          needsScroll ? 'overflow-y-auto' : 'overflow-y-hidden'
        } ${selectedSubRole ? ONBOARDING_BOTTOM_CTA_SPACE_WITH_HINT : 'pb-0'}`}
      >
        <div ref={contentRef}>
          <OnboardingProgress current={3} total={3} tone="employee" className="mb-[14px]" />
          <div className="mb-4">
            <h1 className="font-sans font-extrabold text-display leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
              {t('roles.positionScreenTitle')}
            </h1>
            <p className="text-meta leading-snug text-muted-foreground">
              {t('roles.positionScreenDescription')}
            </p>
          </div>

          <div className="max-w-md w-full mb-[14px]">
            <div className="mb-2 font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
              {t('roles.positionLabel', { defaultValue: 'ПОЗИЦИЯ' })}
            </div>
            <TagGroup
              values={visibleRoles.map(subRole => subRole.id)}
              selectedValues={selectedSubRole ? [selectedSubRole] : []}
              onToggle={handleSelect}
              getLabel={id => {
                const subRole = visibleRoles.find(role => role.id === id)
                return `${EMOJI_BY_ROLE[id as EmployeeRole] ?? '👤'} ${subRole?.title ?? id}`
              }}
              getAriaLabel={id => {
                const subRole = visibleRoles.find(role => role.id === id)
                return t('aria.selectType', { label: subRole?.title ?? id })
              }}
              tone="employee"
            />
          </div>

          <div className="max-w-md w-full">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="font-mono-resta text-meta uppercase tracking-[0.08em] text-muted-foreground">
                {t('roles.specializationLabel')}
              </div>
              <div className="text-meta text-muted-foreground">
                {t('roles.specializationMultiHint')}
              </div>
            </div>
            <TagGroup
              values={specializations}
              selectedValues={selectedSpecializations}
              onToggle={onSpecializationToggle}
              getLabel={getSpecializationLabel}
              getAriaLabel={(_, label) => t('aria.selectSpecialization', { label })}
              tone="employee"
            />
          </div>
        </div>
      </div>

      {selectedSubRole ? (
        <OnboardingBottomCta onClick={onContinue} tone="employee" showFillLaterHint>
          {t('roles.continuePosition')}
        </OnboardingBottomCta>
      ) : null}
    </div>
  )
})

/**
 * Экран выбора позиции сотрудника
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { OnboardingProgress } from '../OnboardingProgress'
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
        } ${
          needsScroll && selectedSubRole
            ? 'pb-[calc(6.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]'
            : 'pb-0'
        }`}
      >
        <div ref={contentRef}>
          <OnboardingProgress current={3} total={3} tone="employee" className="mb-[14px]" />
          <div className="mb-4">
            <h1 className="font-sans font-extrabold text-[22px] leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
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
            <div className="flex flex-wrap gap-2">
              {visibleRoles.map(subRole => (
                <SelectableTagButton
                  key={subRole.originalValue || subRole.id}
                  value={subRole.id}
                  label={`${EMOJI_BY_ROLE[subRole.id] ?? '👤'} ${subRole.title}`}
                  isSelected={selectedSubRole === subRole.id}
                  onClick={handleSelect}
                  tone="employee"
                  ariaLabel={t('aria.selectType', { label: subRole.title })}
                />
              ))}
            </div>
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
            <div className="flex flex-wrap gap-2">
              {specializations.map(spec => (
                <SelectableTagButton
                  key={spec}
                  value={spec}
                  label={getSpecializationLabel(spec)}
                  isSelected={selectedSpecializations.includes(spec)}
                  onClick={onSpecializationToggle}
                  tone="employee"
                  ariaLabel={t('aria.selectSpecialization', {
                    label: getSpecializationLabel(spec),
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedSubRole ? (
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-safe-cta bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="mx-auto w-full max-w-md">
            <Button
              type="button"
              onClick={onContinue}
              variant="gradient"
              size="lg"
              className="w-full bg-role-employee hover:bg-role-employee/90 active:bg-role-employee/80"
            >
              {t('roles.continuePosition')}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground opacity-70">
              {t('profile.fillLaterHint')}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
})

/**
 * Экран выбора позиции сотрудника
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/ui'
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

const SHIFTS_BY_INDEX = ['87 смен', '62 смены', '41 смена', '28 смен']

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
          <OnboardingProgress current={3} total={3} className="mb-[14px]" />
          <SectionHeader
            title={t('roles.positionScreenTitle')}
            description={t('roles.positionScreenDescription')}
            className="mb-4"
          />

          <div className="grid grid-cols-2 gap-1.5 max-w-md w-full content-start mb-[14px]">
            {visibleRoles.map((subRole, index) => {
              const isSelected = selectedSubRole === subRole.id
              return (
                <button
                  key={subRole.originalValue || subRole.id}
                  type="button"
                  onClick={() => handleSelect(subRole.id)}
                  aria-label={t('aria.selectType', { label: subRole.title })}
                  className={[
                    'rounded-lg border px-2 py-3 text-center transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-[#2F2C28] bg-[#11100F] hover:border-[#46413B]',
                  ].join(' ')}
                >
                  <div className="mb-1 text-xl" aria-hidden>
                    {EMOJI_BY_ROLE[subRole.id] ?? '👤'}
                  </div>
                  <div className="text-meta font-semibold leading-tight text-foreground">
                    {subRole.title}
                  </div>
                  <div
                    className={`mt-0.5 text-meta ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {SHIFTS_BY_INDEX[index] ?? t('roles.shiftsDefault')}
                  </div>
                </button>
              )
            })}
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
          <Button
            type="button"
            onClick={onContinue}
            variant="gradient"
            size="lg"
            className="w-full max-w-md mx-auto"
          >
            {t('roles.continuePosition')}
          </Button>
        </div>
      ) : null}
    </div>
  )
})

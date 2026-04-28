/**
 * Экран выбора позиции сотрудника
 */

import { memo, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import type { EmployeeSubRole, EmployeeRole } from '@/shared/types/roles.types'

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
  const visibleRoles = useMemo(() => subRoles, [subRoles])
  const shiftsByIndex = useMemo(() => ['87 смен', '62 смены', '41 смена', '28 смен'], [])
  const emojiByRole = useMemo(
    () =>
      ({
        chef: '👨‍🍳',
        waiter: '🍽',
        barista: '☕',
        bartender: '🍸',
        manager: '📋',
        support: '🎧',
        delivery: '🛵',
        cashier: '💵',
        office: '💼',
      }) as Partial<Record<EmployeeRole, string>>,
    []
  )

  const handleSelect = useCallback(
    (id: string) => {
      const role = subRoles.find(r => r.id === id)
      if (role) onPositionSelect(role.id, role.originalValue || role.id)
    },
    [subRoles, onPositionSelect]
  )

  return (
    <div className="bg-background flex flex-col min-h-[100dvh] ui-density-page ui-density-py pt-[14px]">
      <div
        className="h-[3px] w-full rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={3}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={t('onboarding.stepOf', { current: 3, total: 3 })}
      >
        <div className="h-full w-full rounded-full bg-primary transition-all duration-300" />
      </div>
      <p className="mt-2 mb-[14px] font-mono-resta text-[11px] uppercase tracking-widest text-muted-foreground">
        {t('onboarding.stepOf', { current: 3, total: 3 })}
      </p>

      <h1 className="mb-1.5 text-[22px] font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground">
        {t('roles.positionScreenTitle')}
      </h1>
      <p className="mb-[14px] text-sm leading-[1.35] text-muted-foreground">
        {t('roles.positionScreenDescription')}
      </p>

      <div className="grid grid-cols-3 gap-1.5 max-w-md w-full content-start mb-[14px]">
        {visibleRoles.map((subRole, index) => {
          const isSelected = selectedSubRole === subRole.id
          return (
            <button
              key={subRole.originalValue || subRole.id}
              type="button"
              onClick={() => handleSelect(subRole.id)}
              aria-label={t('aria.selectType', { label: subRole.title })}
              className={[
                'rounded-[14px] border px-2 py-3 text-center transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40',
              ].join(' ')}
            >
              <div className="mb-1 text-xl" aria-hidden>
                {emojiByRole[subRole.id] ?? '👤'}
              </div>
              <div className="text-[11px] font-semibold leading-tight text-foreground">
                {subRole.title}
              </div>
              <div
                className={`mt-0.5 text-[11px] ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {shiftsByIndex[index] ?? t('roles.shiftsDefault')}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mb-[calc(8.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] max-w-md w-full">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="font-mono-resta text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            {t('roles.specializationLabel')}
          </div>
          <div className="text-[11px] text-muted-foreground">
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
              ariaLabel={t('aria.selectSpecialization', { label: getSpecializationLabel(spec) })}
            />
          ))}
        </div>
      </div>

      {selectedSubRole ? (
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[calc(1.25rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] bg-background/95 backdrop-blur-sm border-t border-border">
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

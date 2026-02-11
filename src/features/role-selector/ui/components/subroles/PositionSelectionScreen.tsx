/**
 * Экран выбора позиции сотрудника
 */

import { memo, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { CardSelect } from '@/components/ui/card-select'
import { SectionHeader } from '@/components/ui/section-header'
import { Input } from '@/components/ui/input'
import { OnboardingProgress } from '../OnboardingProgress'
import type { EmployeeSubRole, EmployeeRole } from '@/shared/types/roles.types'

interface PositionSelectionScreenProps {
  subRoles: EmployeeSubRole[]
  selectedSubRole: string | null
  onPositionSelect: (role: EmployeeRole, positionValue: string) => void
  onContinue: () => void
}

export const PositionSelectionScreen = memo(function PositionSelectionScreen({
  subRoles,
  selectedSubRole,
  onPositionSelect,
  onContinue,
}: PositionSelectionScreenProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return subRoles
    const q = searchQuery.trim().toLowerCase()
    return subRoles.filter(r => r.title.toLowerCase().includes(q))
  }, [subRoles, searchQuery])

  const handleSelect = useCallback(
    (id: string) => {
      const role = subRoles.find(r => r.id === id)
      if (role) onPositionSelect(role.id, role.originalValue || role.id)
    },
    [subRoles, onPositionSelect]
  )

  return (
    <div className="bg-background flex flex-col min-h-[100dvh] px-6 py-6">
      <OnboardingProgress current={2} total={3} className="mb-4" />
      <SectionHeader
        title={t('roles.positionScreenTitle')}
        description={t('roles.positionScreenDescription')}
        className="mb-6"
      />

      <div className="relative mb-4 max-w-md mx-auto w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={t('roles.positionSearchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl bg-input-background"
          aria-label={t('roles.positionSearchPlaceholder')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full flex-1 content-start pb-24">
        {filteredRoles.length === 0 ? (
          <p className="col-span-2 text-sm text-muted-foreground text-center py-6">
            {searchQuery.trim() ? t('common.nothingFound') : null}
          </p>
        ) : null}
        {filteredRoles.map((subRole, index) => {
          const Icon = subRole.icon
          const isSelected = selectedSubRole === subRole.id
          return (
            <CardSelect
              key={subRole.originalValue || subRole.id}
              id={subRole.id}
              title={subRole.title}
              image={<Icon className="w-7 h-7 text-white" aria-hidden="true" />}
              imageType="icon"
              isSelected={isSelected}
              index={index}
              layout="vertical"
              onSelect={handleSelect}
              ariaLabel={t('aria.selectType', { label: subRole.title })}
            />
          )
        })}
      </div>

      {selectedSubRole ? (
        <div className="fixed bottom-0 left-0 right-0 p-4 pt-3 safe-area-bottom bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            type="button"
            onClick={onContinue}
            className="w-full max-w-md mx-auto flex py-3 rounded-xl text-white font-medium gradient-primary shadow-lg flex items-center justify-center"
          >
            {t('roles.continuePosition')}
          </button>
        </div>
      ) : null}
    </div>
  )
})

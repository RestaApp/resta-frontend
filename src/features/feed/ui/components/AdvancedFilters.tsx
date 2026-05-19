import { useTranslation } from 'react-i18next'
import { Drawer, DrawerCloseButton } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { LocationField } from '@/features/role-selector/ui/components/subroles/shared/LocationField'
import { useAdvancedFiltersSheet } from '../../model/hooks/useAdvancedFiltersSheet'
import type { AdvancedFiltersData } from '@/features/feed/model/types'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleKind, getRoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: AdvancedFiltersData | null) => void
  initialFilters?: AdvancedFiltersData
  isVacancy?: boolean
}

export const AdvancedFilters = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  isVacancy = false,
}: AdvancedFiltersProps) => (
  <Drawer
    open={isOpen}
    onOpenChange={open => !open && onClose()}
    overlayClassName="bg-[rgba(5,7,14,0.78)] backdrop-blur-[2px]"
  >
    <AdvancedFiltersSheet
      onClose={onClose}
      onApply={onApply}
      initialFilters={initialFilters}
      isVacancy={isVacancy}
    />
  </Drawer>
)

const SHEET_SURFACE_CLASS = 'bg-background dark:bg-[var(--drawer-surface)]'

const SECTION_LABEL_CLASS =
  'text-micro font-semibold uppercase tracking-widest text-muted-foreground'

const FilterSectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className={SECTION_LABEL_CLASS}>{children}</p>
)

const AdvancedFiltersSheet = ({
  onClose,
  onApply,
  initialFilters,
  isVacancy,
}: Omit<AdvancedFiltersProps, 'isOpen'>) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const selectedRole = useAppSelector(selectSelectedRole)
  const roleTheme = getRoleTheme(selectedRole ?? 'employee')
  const roleKind = getRoleKind(selectedRole ?? 'employee')
  const tagTone = roleKind

  const c = useAdvancedFiltersSheet({
    initialFilters: initialFilters || null,
    onApply,
  })

  const handleShowResults = () => {
    c.handleApply()
    onClose()
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', SHEET_SURFACE_CLASS)}>
      <div
        className={cn(
          'sticky top-0 z-10 flex shrink-0 items-center justify-between px-4 pt-2 pb-0 mb-3.5',
          SHEET_SURFACE_CLASS
        )}
      >
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {t('feed.filters')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={c.handleReset}
            disabled={!c.hasActiveFilters}
            className={cn(
              'text-sm font-medium transition-opacity disabled:opacity-40',
              roleTheme.classes.text
            )}
          >
            {t('feed.resetFiltersSheet')}
          </button>
          <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} className="-mr-2" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-4">
        {c.positions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <FilterSectionLabel>{t('feed.sectionPosition')}</FilterSectionLabel>
            <div className="flex flex-wrap gap-2">
              {c.positions.map(position => {
                const positionValue = position.originalValue || position.id
                return (
                  <SelectableTagButton
                    key={positionValue}
                    value={positionValue}
                    label={position.title}
                    isSelected={c.selectedPosition === positionValue}
                    onClick={() => c.handlePositionSelect(positionValue)}
                    ariaLabel={t('aria.selectPosition', { label: position.title })}
                    tone={tagTone}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {c.selectedPosition && c.displaySpecializations.length > 0 ? (
          <div className="relative flex shrink-0 flex-col gap-2 overflow-visible">
            <FilterSectionLabel>{t('shift.specialization')}</FilterSectionLabel>
            <div className="relative flex flex-wrap gap-2">
              {c.displaySpecializations.map(specialization => (
                <SelectableTagButton
                  key={specialization}
                  value={specialization}
                  label={getSpecializationLabel(specialization)}
                  isSelected={c.selectedSpecializations.includes(specialization)}
                  onClick={() => c.toggleSpecialization(specialization)}
                  ariaLabel={t('aria.selectSpecialization', {
                    label: getSpecializationLabel(specialization),
                  })}
                  tone={tagTone}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <FilterSectionLabel>{t('feed.sectionCity')}</FilterSectionLabel>
          <LocationField
            value={c.selectedCity}
            onChange={c.setSelectedCity}
            onLocationRequest={() => undefined}
            showLocationButton={false}
            clearOnFocus
            hideLabel
            isLoading={false}
            focusAccentClass={roleTheme.classes.inputFocus}
            focusRoleCssVar={roleTheme.cssVar}
          />
        </div>
      </div>

      <div className={cn('flex shrink-0 border-t border-border/50 px-4 py-3', SHEET_SURFACE_CLASS)}>
        <Button
          type="button"
          variant="ghost"
          size="md"
          className={cn(
            'w-full min-w-0 border-0 font-semibold shadow-sm hover:opacity-95',
            roleTheme.classes.bg,
            roleTheme.classes.textOn,
            roleTheme.classes.solidHover,
            roleTheme.classes.ring
          )}
          onClick={handleShowResults}
        >
          {isVacancy ? t('feed.showVacanciesCta') : t('feed.showShiftsCount')}
        </Button>
      </div>
    </div>
  )
}

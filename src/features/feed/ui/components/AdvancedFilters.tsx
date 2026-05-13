import { Loader } from '@/components/ui/loader'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { Drawer, DrawerCloseButton } from '@/components/ui/drawer'
import { RangeSlider } from '@/components/ui/range-slider'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { LocationField } from '@/features/role-selector/ui/components/subroles/shared/LocationField'
import { useAdvancedFiltersSheet } from '../../model/hooks/useAdvancedFiltersSheet'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleKind, getRoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'
import { saveFeedFilterTemplate } from '../../model/utils/feedFilterTemplates'
import type { WhenPreset } from '../../model/utils/feedFilterWhen'

export type { WhenPreset }

export interface AdvancedFiltersData {
  selectedCity?: string | null
  selectedPosition?: string | null
  selectedSpecializations?: string[]
  startDate?: string | null
  endDate?: string | null
  whenPreset?: WhenPreset | null
  geoLat?: number | null
  geoLon?: number | null
  radiusKm?: number | null
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: AdvancedFiltersData | null) => void
  initialFilters?: AdvancedFiltersData
  filteredCount?: number
  searchQuery?: string
  activeFilter?: string
  isVacancy?: boolean
}

export const AdvancedFilters = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  filteredCount,
  isVacancy = false,
}: AdvancedFiltersProps) => (
  <Drawer open={isOpen} onOpenChange={open => !open && onClose()}>
    <AdvancedFiltersSheet
      onClose={onClose}
      onApply={onApply}
      initialFilters={initialFilters}
      filteredCount={filteredCount}
      isVacancy={isVacancy}
    />
  </Drawer>
)

/** Совпадает с панелью `Drawer`: светлая — background, тёмная — drawer-surface (без «шва» у футера). */
const SHEET_SURFACE_CLASS = 'bg-background dark:bg-[var(--drawer-surface)]'

/** Как `.input-lbl` в E03: мелкий капс, приглушённый цвет. */
const SECTION_LABEL_CLASS =
  'text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'

const FilterSectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className={SECTION_LABEL_CLASS}>{children}</p>
)

const AdvancedFiltersSheet = ({
  onClose,
  onApply,
  initialFilters,
  filteredCount,
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
    isVacancy: !!isVacancy,
    filteredCount,
  })

  const whenOptions: { id: WhenPreset; labelKey: string }[] = [
    { id: 'today', labelKey: 'feed.whenPreset.today' },
    { id: 'tomorrow', labelKey: 'feed.whenPreset.tomorrow' },
    { id: 'week', labelKey: 'feed.whenPreset.week' },
  ]

  const handleSaveTemplate = () => {
    saveFeedFilterTemplate(isVacancy ? 'jobs' : 'shifts', c.currentFilters)
  }

  const handleShowResults = () => {
    c.handleApply()
    onClose()
  }

  const selectWhenPreset = (preset: WhenPreset) => {
    if (c.whenPreset === preset) {
      c.setWhenPresetAndDates(null)
    } else {
      c.setWhenPresetAndDates(preset)
    }
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

      <motion.div
        layout
        transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
        className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-4"
      >
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
                    onClick={() => c.handlePositionClick(positionValue)}
                    ariaLabel={t('aria.selectPosition', { label: position.title })}
                    tone={tagTone}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {!isVacancy ? (
          <div className="flex flex-col gap-2">
            <FilterSectionLabel>{t('feed.sectionWhen')}</FilterSectionLabel>
            <div className="flex flex-wrap gap-2">
              {whenOptions.map(opt => (
                <SelectableTagButton
                  key={opt.id}
                  value={opt.id}
                  label={t(opt.labelKey)}
                  isSelected={c.whenPreset === opt.id}
                  onClick={v => selectWhenPreset(v as WhenPreset)}
                  ariaLabel={t(opt.labelKey)}
                  tone={tagTone}
                />
              ))}
            </div>
          </div>
        ) : null}

        {c.hasSharedGeo ? (
          <div className="flex flex-col gap-2 py-2">
            <FilterSectionLabel>{t('feed.sectionRadius')}</FilterSectionLabel>
            <RangeSlider
              min={0}
              max={10}
              step={1}
              value={c.radiusKm}
              onChange={v => c.setRadiusKm(v)}
              accentClassName={roleTheme.classes.bg}
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              <span>{t('feed.radiusMin')}</span>
              <span className="font-mono-resta tabular-nums">
                {t('feed.radiusCurrent', { km: c.radiusKm })}
              </span>
              <span>{t('feed.radiusMax')}</span>
            </div>
            <button
              type="button"
              onClick={() => c.setSharedCoordinates(null, null)}
              className={cn('text-sm font-medium', roleTheme.classes.text)}
            >
              {t('feed.clearGeoUseCity')}
            </button>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {c.selectedPosition &&
            (c.displaySpecializations.length > 0 || c.isSpecializationsLoading) && (
              <motion.div
                key={`specializations-${c.selectedPosition}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative flex shrink-0 flex-col gap-2 overflow-visible"
              >
                <FilterSectionLabel>{t('shift.specialization')}</FilterSectionLabel>
                <div className="relative flex flex-wrap gap-2">
                  {c.isSpecializationsLoading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
                      <Loader size="md" />
                    </div>
                  ) : null}
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
                      disabled={c.isSpecializationsLoading}
                      tone={tagTone}
                    />
                  ))}
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {!c.hasSharedGeo ? (
          <div className="flex flex-col gap-2">
            <FilterSectionLabel>{t('feed.sectionCity')}</FilterSectionLabel>
            <LocationField
              value={c.selectedCity}
              onChange={c.setSelectedCity}
              onLocationRequest={c.handleLocationRequest}
              clearOnFocus
              hideLabel
              isLoading={c.isGeoLoading}
              focusAccentClass={roleTheme.classes.inputFocus}
              focusRoleCssVar={roleTheme.cssVar}
            />
          </div>
        ) : null}
      </motion.div>

      <div
        className={cn(
          'flex shrink-0 gap-2 border-t border-border/50 px-4 py-3',
          SHEET_SURFACE_CLASS
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="md"
          className={cn('min-w-0 flex-1', roleTheme.classes.ring)}
          onClick={handleSaveTemplate}
        >
          {t('feed.saveFilterTemplate')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          className={cn(
            'min-w-0 shrink-0 flex-[1.35] border-0 font-semibold shadow-sm hover:opacity-95',
            roleTheme.classes.bg,
            roleTheme.classes.textOn,
            roleTheme.classes.solidHover,
            roleTheme.classes.ring
          )}
          onClick={handleShowResults}
        >
          {isVacancy ? t('feed.showVacanciesCta') : t('feed.showShiftsCountDetailed', { count: c.previewCount })}
        </Button>
      </div>
    </div>
  )
}

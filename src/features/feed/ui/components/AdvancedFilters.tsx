import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { Drawer, DrawerCloseButton } from '@/components/ui/drawer'
import { RangeSlider, DatePicker } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { BynIcon } from '@/components/ui/byn-icon'
import { Input } from '@/components/ui/input'
import { DRAWER_FOOTER_CLASS, DRAWER_HEADER_CLASS } from '@/components/ui/ui-patterns'
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { LocationField } from '@/features/role-selector/ui/components/subroles/shared/LocationField'
import { useAdvancedFiltersSheet } from '../../model/hooks/useAdvancedFiltersSheet'
import { formatMoney } from '../../model/utils/formatting'

export interface AdvancedFiltersData {
  priceRange: [number, number] | null
  selectedCity?: string | null
  selectedPosition?: string | null
  selectedSpecializations?: string[]
  startDate?: string | null // YYYY-MM-DD
  endDate?: string | null // YYYY-MM-DD
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: AdvancedFiltersData | null) => void
  initialFilters?: AdvancedFiltersData
  filteredCount?: number
  searchQuery?: string
  activeFilter?: string
  /** Флаг для вакансий (скрыть период, изменить текст и расширить максимум диапазона). */
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

const AdvancedFiltersSheet = ({
  onClose,
  onApply,
  initialFilters,
  filteredCount,
  isVacancy,
}: Omit<AdvancedFiltersProps, 'isOpen'>) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const c = useAdvancedFiltersSheet({
    initialFilters: initialFilters || null,
    onApply,
    isVacancy: !!isVacancy,
    filteredCount,
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className={`${DRAWER_HEADER_CLASS} sticky top-0 z-10 flex flex-shrink-0 items-center justify-between bg-background`}
      >
        <h2 className="text-xl font-bold">{t('feed.filters')}</h2>
        <div className="flex items-center gap-2">
          {c.hasActiveFilters && (
            <Button
              onClick={c.handleReset}
              variant="secondary"
              size="sm"
              aria-label={t('feed.resetFiltersAria')}
              className="rounded-full px-3 py-1.5"
            >
              {t('common.reset')}
            </Button>
          )}
          <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} className="-mr-2" />
        </div>
      </div>

      <motion.div
        layout
        transition={{ layout: { duration: 0.25, ease: 'easeInOut' } }}
        className="ui-density-page ui-density-stack-lg overflow-y-auto flex-1 min-h-0 pb-4"
      >
        <BudgetRangeSection
          isVacancy={!!isVacancy}
          maxRateLimit={c.maxRateLimit}
          displayPriceRange={c.displayPriceRange}
          onRangeChange={c.handleRangeChange}
          onMinInputChange={c.handleMinInputChange}
          onMaxInputChange={c.handleMaxInputChange}
        />

        {!isVacancy && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">{t('feed.period')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <DatePicker
                  value={c.startDate}
                  onChange={c.setStartDate}
                  minDate={c.getMinStartDate()}
                  label={t('common.from')}
                />
              </div>
              <div className="min-w-0">
                <DatePicker
                  value={c.endDate}
                  onChange={c.setEndDate}
                  minDate={c.getMinEndDate()}
                  label={t('common.to')}
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-base">{t('profile.city')}</h3>
          <LocationField
            value={c.selectedCity}
            onChange={c.setSelectedCity}
            onLocationRequest={c.handleLocationRequest}
            clearOnFocus
            hideLabel
          />
        </div>

        {c.positions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-base">{t('common.position')}</h3>
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
                  />
                )
              })}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {c.selectedPosition &&
            (c.displaySpecializations.length > 0 || c.isSpecializationsLoading) && (
              <motion.div
                key={`specializations-${c.selectedPosition}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                layout
                className="space-y-3 overflow-hidden relative"
              >
                <h3 className="font-semibold text-base">{t('shift.specialization')}</h3>
                <div className="flex flex-wrap gap-2 relative">
                  {c.isSpecializationsLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  )}
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
                    />
                  ))}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      <div className={`${DRAWER_FOOTER_CLASS} flex-shrink-0`}>
        <Button
          type="button"
          onClick={() => {
            c.handleApply()
            onClose()
          }}
          variant="gradient"
          size="md"
          className="w-full"
        >
          {isVacancy
            ? t('feed.showVacanciesCount', { count: c.previewCount })
            : t('feed.showShiftsCount', { count: c.previewCount })}
        </Button>
      </div>
    </div>
  )
}

interface BudgetRangeSectionProps {
  isVacancy: boolean
  maxRateLimit: number
  displayPriceRange: [number, number]
  onRangeChange: (range: [number, number]) => void
  onMinInputChange: React.ChangeEventHandler<HTMLInputElement>
  onMaxInputChange: React.ChangeEventHandler<HTMLInputElement>
}

const BudgetRangeSection = ({
  isVacancy,
  maxRateLimit,
  displayPriceRange,
  onRangeChange,
  onMinInputChange,
  onMaxInputChange,
}: BudgetRangeSectionProps) => {
  const { t } = useTranslation()
  return (
    <div className="ui-density-stack">
      <div className="py-2 flex flex-wrap justify-between items-center gap-x-3 gap-y-2">
        <h3 className="font-semibold text-base">
          {isVacancy ? t('feed.ratePerVacancy') : t('feed.ratePerShift')}
        </h3>
        <div className="flex items-center gap-1.5 min-w-0 ml-auto">
          <Input
            type="text"
            inputMode="numeric"
            min={0}
            max={maxRateLimit}
            step={1}
            value={formatMoney(displayPriceRange[0])}
            onChange={onMinInputChange}
            aria-label={t('feed.filterRateMinAria')}
            className="h-9 w-[4.5rem] min-w-0 px-2 text-center text-sm font-semibold tabular-nums"
          />
          <span className="text-muted-foreground shrink-0" aria-hidden>
            —
          </span>
          <Input
            type="text"
            inputMode="numeric"
            min={0}
            max={maxRateLimit}
            step={1}
            value={formatMoney(displayPriceRange[1])}
            onChange={onMaxInputChange}
            aria-label={t('feed.filterRateMaxAria')}
            className="h-9 w-[4.5rem] min-w-0 px-2 text-center text-sm font-semibold tabular-nums"
          />
          <BynIcon className="text-primary text-sm shrink-0" />
        </div>
      </div>
      <RangeSlider
        min={0}
        max={maxRateLimit}
        step={isVacancy ? 50 : 5}
        range={displayPriceRange}
        onRangeChange={onRangeChange}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t('feed.filterScaleMin')}</span>
        <span>{isVacancy ? t('feed.filterScaleMaxVacancy') : t('feed.filterScaleMaxShift')}</span>
      </div>
    </div>
  )
}

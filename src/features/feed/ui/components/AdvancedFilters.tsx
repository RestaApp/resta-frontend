import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { useLabels } from '@/shared/i18n/hooks'
import { ExpandableTagList } from '@/shared/ui/ExpandableTagList'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { CityAutocompleteField } from '@/components/ui/city-autocomplete-field'
import { useAdvancedFiltersSheet } from '../../model/hooks/useAdvancedFiltersSheet'
import { DATE_FILTER_PRESETS, SALARY_RANGE_OPTIONS } from '@/shared/shifts/filterConstants'
import { getTodayDateISO } from '@/shared/utils/datetime'
import type { AdvancedFiltersData } from '@/shared/shifts/types'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'

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
  <Drawer open={isOpen} onOpenChange={open => !open && onClose()}>
    <AdvancedFiltersSheet
      key={isOpen ? JSON.stringify(initialFilters ?? null) : 'closed'}
      onClose={onClose}
      onApply={onApply}
      initialFilters={initialFilters}
      isVacancy={isVacancy}
    />
  </Drawer>
)

const AdvancedFiltersSheet = ({
  onClose,
  onApply,
  initialFilters,
  isVacancy,
}: Omit<AdvancedFiltersProps, 'isOpen'>) => {
  const { t } = useTranslation()
  const { getSpecializationLabel } = useLabels()
  const c = useAdvancedFiltersSheet({
    initialFilters: initialFilters || null,
    onApply,
    includeDateFilter: !isVacancy,
  })

  const handleShowResults = () => {
    c.handleApply()
    onClose()
  }

  return (
    <DrawerFrame className="flex-1">
      <DrawerHeader>
        <div className="flex items-center justify-between gap-2">
          <DrawerTitle>{t('feed.filters')}</DrawerTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={c.handleReset}
              disabled={!c.hasActiveFilters}
            >
              {t('feed.resetFiltersSheet')}
            </Button>
            <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-3">
        {c.positions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className={PROFILE_SECTION_LABEL_CLASS}>{t('feed.sectionPosition')}</p>
            <ExpandableTagList
              items={c.positions}
              getKey={position => position.originalValue || position.id}
              priorityKeys={c.selectedPosition ? [c.selectedPosition] : []}
              renderItem={position => {
                const positionValue = position.originalValue || position.id
                return (
                  <SelectableTagButton
                    value={positionValue}
                    label={position.title}
                    isSelected={c.selectedPosition === positionValue}
                    onClick={() => c.handlePositionSelect(positionValue)}
                    ariaLabel={t('aria.selectPosition', { label: position.title })}
                  />
                )
              }}
            />
          </div>
        ) : null}

        {c.selectedPosition && c.displaySpecializations.length > 0 ? (
          <div className="relative flex shrink-0 flex-col gap-2 overflow-visible">
            <p className={PROFILE_SECTION_LABEL_CLASS}>{t('shift.specialization')}</p>
            <ExpandableTagList
              key={c.selectedPosition}
              items={c.displaySpecializations}
              getKey={specialization => specialization}
              priorityKeys={c.selectedSpecializations}
              renderItem={specialization => (
                <SelectableTagButton
                  value={specialization}
                  label={getSpecializationLabel(specialization)}
                  isSelected={c.selectedSpecializations.includes(specialization)}
                  onClick={() => c.toggleSpecialization(specialization)}
                  ariaLabel={t('aria.selectSpecialization', {
                    label: getSpecializationLabel(specialization),
                  })}
                />
              )}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {isVacancy ? t('feed.ratePerVacancy') : t('feed.ratePerShift')}
          </p>
          <div className="flex flex-wrap gap-2">
            {SALARY_RANGE_OPTIONS.map(range => (
              <SelectableTagButton
                key={range.id}
                value={range.id}
                label={t(`feed.salaryRange.${range.id}`)}
                isSelected={c.selectedSalaryRange === range.id}
                onClick={() => c.handleSalaryRangeSelect(range.id)}
                ariaLabel={t('feed.filterSalaryRangeAria', {
                  label: t(`feed.salaryRange.${range.id}`),
                })}
              />
            ))}
          </div>
        </div>

        {!isVacancy ? (
          <div className="flex flex-col gap-2">
            <p className={PROFILE_SECTION_LABEL_CLASS}>{t('feed.sectionWhen')}</p>
            <div className="flex flex-wrap gap-2">
              {DATE_FILTER_PRESETS.map(preset => (
                <SelectableTagButton
                  key={preset}
                  value={preset}
                  label={t(`feed.whenPreset.${preset}`)}
                  isSelected={c.selectedDatePreset === preset}
                  onClick={() => c.handleDatePresetSelect(preset)}
                  ariaLabel={t('feed.filterDatePresetAria', {
                    label: t(`feed.whenPreset.${preset}`),
                  })}
                />
              ))}
            </div>
            {c.selectedDatePreset === 'custom' ? (
              <div className="flex flex-col gap-2">
                <p className={PROFILE_SECTION_LABEL_CLASS}>{t('feed.period')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={c.customStartDate}
                    onChange={c.setCustomStartDate}
                    minDate={getTodayDateISO()}
                    label={t('feed.customDateFrom')}
                    className="min-w-0"
                  />
                  <DatePicker
                    value={c.customEndDate}
                    onChange={c.setCustomEndDate}
                    minDate={c.customStartDate ?? getTodayDateISO()}
                    label={t('feed.customDateTo')}
                    className="min-w-0"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className={PROFILE_SECTION_LABEL_CLASS}>{t('feed.sectionCity')}</p>
          <CityAutocompleteField
            value={c.selectedCity}
            onChange={c.setSelectedCity}
            onLocationRequest={() => undefined}
            showLocationButton={false}
            clearOnFocus
            hideLabel
            isLoading={false}
          />
        </div>
      </DrawerBody>

      <DrawerFooter>
        <Button variant="gradient" size="md" className="w-full" onClick={handleShowResults}>
          {isVacancy ? t('feed.showVacanciesCta') : t('feed.showShiftsCount')}
        </Button>
      </DrawerFooter>
    </DrawerFrame>
  )
}

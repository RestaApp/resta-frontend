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
import { useLabels } from '@/shared/i18n/hooks'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { LocationField } from '@/features/role-selector/ui/components/subroles/shared/LocationField'
import { useAdvancedFiltersSheet } from '../../model/hooks/useAdvancedFiltersSheet'
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
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {c.selectedPosition && c.displaySpecializations.length > 0 ? (
          <div className="relative flex shrink-0 flex-col gap-2 overflow-visible">
            <p className={PROFILE_SECTION_LABEL_CLASS}>{t('shift.specialization')}</p>
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
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className={PROFILE_SECTION_LABEL_CLASS}>{t('feed.sectionCity')}</p>
          <LocationField
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

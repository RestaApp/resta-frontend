import { useTranslation } from 'react-i18next'
import { Select } from '@/components/ui/select'
import { LocationField, MultiSelectSpecializations } from '../../fields'
import type { AddShiftDrawerStep1Props } from './types'

export const AddShiftDrawerStep1 = ({
  locationRef,
  positionRef,
  specializationRef,
  location,
  onLocationChange,
  locationError,
  formPosition,
  onPositionChange,
  positionOptions,
  isPositionsLoading,
  positionError,
  specializations,
  onSpecializationsChange,
  availableSpecializations,
  isSpecializationsLoading,
  specializationError,
}: AddShiftDrawerStep1Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div ref={locationRef}>
        <LocationField
          label={t('common.location')}
          value={location}
          onChange={onLocationChange}
          placeholder={t('shift.locationPlaceholder')}
          error={locationError}
        />
      </div>

      <div ref={positionRef}>
        <Select
          label={t('common.position')}
          value={formPosition || ''}
          onChange={onPositionChange}
          options={positionOptions}
          placeholder={t('shift.selectPosition')}
          disabled={isPositionsLoading}
          error={positionError}
        />
      </div>

      <div ref={specializationRef}>
        <MultiSelectSpecializations
          label={t('shift.specialization')}
          value={specializations}
          onChange={onSpecializationsChange}
          options={availableSpecializations}
          placeholder={
            !formPosition ? t('shift.selectPositionFirst') : t('shift.noSpecializations')
          }
          disabled={!formPosition}
          isLoading={isSpecializationsLoading}
          error={specializationError}
        />
      </div>
    </>
  )
}

import { useTranslation } from 'react-i18next'
import { CitySelect } from '@/components/ui/city-select'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCities } from '@/shared/lib/hooks/useCities'
import { Field, MultiSelectSpecializations, ShiftLocationField } from '../../fields'
import type { AddShiftDrawerStep1Props } from './types'

export const AddShiftDrawerStep1 = ({
  locationRef,
  positionRef,
  specializationRef,
  location,
  onLocationChange,
  locationError,
  city,
  onCityChange,
  cityError,
  profileAddresses,
  isEmployeeMode,
  employeePositionLabel,
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
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: true })

  // Employee: один адрес как строка (внутри держим как массив из 1 элемента).
  const employeeAddress = location[0] ?? ''
  const handleEmployeeAddressChange = (next: string) => {
    onLocationChange(next ? [next] : [])
  }

  return (
    <>
      <div ref={locationRef} className="flex flex-col gap-3">
        <Field label={t('profile.city')} error={cityError}>
          <CitySelect
            value={city}
            onChange={onCityChange}
            options={cities}
            placeholder={t('profile.form.cityPlaceholder')}
            disabled={isCitiesLoading}
            error={cityError}
          />
        </Field>

        {isEmployeeMode ? (
          <Field label={t('common.location')} error={locationError}>
            <Input
              value={employeeAddress}
              onChange={e => handleEmployeeAddressChange(e.target.value)}
              placeholder={t('shift.locationPlaceholder')}
              aria-invalid={!!locationError}
            />
          </Field>
        ) : (
          <ShiftLocationField
            label={t('common.location')}
            value={location}
            onChange={onLocationChange}
            profileAddresses={profileAddresses}
            placeholder={t('shift.locationPlaceholder')}
            error={locationError}
          />
        )}
      </div>

      {isEmployeeMode ? (
        <div ref={positionRef}>
          <Field label={t('common.position')} error={positionError}>
            <Input value={employeePositionLabel || ''} readOnly aria-invalid={!!positionError} />
          </Field>
        </div>
      ) : (
        <div ref={positionRef}>
          <Select
            label={t('common.position')}
            value={formPosition || ''}
            onChange={onPositionChange}
            options={positionOptions}
            placeholder={t('shift.selectPosition')}
            searchable={false}
            disabled={isPositionsLoading}
            error={positionError}
          />
        </div>
      )}

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

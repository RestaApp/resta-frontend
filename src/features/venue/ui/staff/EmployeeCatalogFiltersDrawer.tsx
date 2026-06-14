import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { CityAutocompleteField } from '@/components/ui/city-autocomplete-field'
import { Select } from '@/components/ui/select'
import { CatalogFiltersDrawerShell } from '@/shared/ui/CatalogFiltersDrawerShell'
import type { EmployeeSubRole } from '@/shared/types/roles.types'
import type { EmployeeCatalogFilters } from './employeeCatalogTypes'

interface EmployeeCatalogFiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftFilters: EmployeeCatalogFilters
  setDraftFilters: Dispatch<SetStateAction<EmployeeCatalogFilters>>
  cities: string[]
  isCitiesLoading: boolean
  positions: EmployeeSubRole[]
  specializations: string[]
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
  onApply: () => void
  onReset: () => void
}

export const EmployeeCatalogFiltersDrawer = ({
  open,
  onOpenChange,
  draftFilters,
  setDraftFilters,
  cities,
  isCitiesLoading,
  positions,
  specializations,
  getEmployeePositionLabel,
  getSpecializationLabel,
  onApply,
  onReset,
}: EmployeeCatalogFiltersDrawerProps) => {
  const { t } = useTranslation()

  const positionOptions = [
    {
      value: '',
      label: t('venueUi.staff.catalog.filters.allPositions', { defaultValue: 'Все должности' }),
    },
    ...positions.map(position => {
      const value = position.originalValue ?? position.id
      return {
        value,
        label: position.title || getEmployeePositionLabel(value),
      }
    }),
  ]

  const specializationOptions = [
    {
      value: '',
      label: t('venueUi.staff.catalog.filters.allSpecializations', {
        defaultValue: 'Все специализации',
      }),
    },
    ...specializations.map(specialization => ({
      value: specialization,
      label: getSpecializationLabel(specialization),
    })),
  ]

  return (
    <CatalogFiltersDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title={t('venueUi.staff.catalog.filters.title', { defaultValue: 'Фильтры сотрудников' })}
      applyLabel={t('venueUi.staff.catalog.filters.apply', {
        defaultValue: 'Показать сотрудников',
      })}
      onApply={onApply}
      onReset={onReset}
    >
      <CityAutocompleteField
        label={t('profile.city', { defaultValue: 'Город' })}
        value={draftFilters.city}
        onChange={city => setDraftFilters(prev => ({ ...prev, city }))}
        options={cities}
        disabled={isCitiesLoading}
        isLoading={isCitiesLoading}
        placeholder={t('common.selectCity', { defaultValue: 'Выберите город' })}
        showLocationButton={false}
        validateOnBlur={false}
      />

      <Select
        label={t('venueUi.staff.catalog.filters.position', { defaultValue: 'Должность' })}
        value={draftFilters.position ?? ''}
        onChange={value =>
          setDraftFilters(prev => ({
            ...prev,
            position: value || null,
            specialization: null,
          }))
        }
        options={positionOptions}
        placeholder={t('venueUi.staff.catalog.filters.allPositions', {
          defaultValue: 'Все должности',
        })}
      />

      {draftFilters.position ? (
        <Select
          label={t('venueUi.staff.catalog.filters.specialization', {
            defaultValue: 'Специализация',
          })}
          value={draftFilters.specialization ?? ''}
          onChange={value =>
            setDraftFilters(prev => ({
              ...prev,
              specialization: value || null,
            }))
          }
          options={specializationOptions}
          placeholder={t('venueUi.staff.catalog.filters.allSpecializations', {
            defaultValue: 'Все специализации',
          })}
        />
      ) : null}
    </CatalogFiltersDrawerShell>
  )
}

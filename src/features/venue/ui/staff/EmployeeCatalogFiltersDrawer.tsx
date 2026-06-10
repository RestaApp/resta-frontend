import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { CitySelect } from '@/components/ui/city-select'
import { Select } from '@/components/ui/select'
import type { EmployeeSubRole } from '@/shared/types/roles.types'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame>
        <DrawerHeader>
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>
              {t('venueUi.staff.catalog.filters.title', { defaultValue: 'Фильтры сотрудников' })}
            </DrawerTitle>
            <DrawerCloseButton
              onClick={() => onOpenChange(false)}
              ariaLabel={t('common.close', { defaultValue: 'Закрыть' })}
            />
          </div>
        </DrawerHeader>

        <DrawerBody className="ui-density-stack">
          <div className="ui-density-stack">
            <p className={PROFILE_SECTION_LABEL_CLASS}>
              {t('profile.city', { defaultValue: 'Город' })}
            </p>
            <CitySelect
              value={draftFilters.city}
              onChange={city => setDraftFilters(prev => ({ ...prev, city }))}
              options={cities}
              disabled={isCitiesLoading}
              placeholder={t('common.selectCity', { defaultValue: 'Выберите город' })}
            />
          </div>

          <div className="ui-density-stack">
            <p className={PROFILE_SECTION_LABEL_CLASS}>
              {t('venueUi.staff.catalog.filters.position', { defaultValue: 'Должность' })}
            </p>
            <Select
              value={draftFilters.position ?? ''}
              onChange={value =>
                setDraftFilters(prev => ({
                  ...prev,
                  position: value || null,
                  specialization: null,
                }))
              }
              options={positionOptions}
            />
          </div>

          {draftFilters.position ? (
            <div className="ui-density-stack">
              <p className={PROFILE_SECTION_LABEL_CLASS}>
                {t('venueUi.staff.catalog.filters.specialization', {
                  defaultValue: 'Специализация',
                })}
              </p>
              <Select
                value={draftFilters.specialization ?? ''}
                onChange={value =>
                  setDraftFilters(prev => ({
                    ...prev,
                    specialization: value || null,
                  }))
                }
                options={specializationOptions}
              />
            </div>
          ) : null}
        </DrawerBody>

        <DrawerFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onReset}>
            {t('common.reset', { defaultValue: 'Сбросить' })}
          </Button>
          <Button type="button" onClick={onApply}>
            {t('venueUi.staff.catalog.filters.apply', { defaultValue: 'Показать сотрудников' })}
          </Button>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
}

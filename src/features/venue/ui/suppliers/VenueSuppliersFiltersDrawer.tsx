import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerCloseButton,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { CitySelect } from '@/components/ui/city-select'
import type { SupplierFilters } from './types'
import { formatServiceCategory } from './mappers'

interface VenueSuppliersFiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftFilters: SupplierFilters
  setDraftFilters: Dispatch<SetStateAction<SupplierFilters>>
  supplierTypeOptions: string[]
  serviceCategoryOptions: string[]
  cities: string[]
  isCitiesLoading: boolean
  getSupplierTypeLabel: (value: string) => string
  onApply: () => void
  onReset: () => void
}

export const VenueSuppliersFiltersDrawer = ({
  open,
  onOpenChange,
  draftFilters,
  setDraftFilters,
  supplierTypeOptions,
  serviceCategoryOptions,
  cities,
  isCitiesLoading,
  getSupplierTypeLabel,
  onApply,
  onReset,
}: VenueSuppliersFiltersDrawerProps) => {
  const { t } = useTranslation()

  const toggleDraftServiceCategory = (value: string) => {
    setDraftFilters(prev => {
      const exists = prev.serviceCategories.includes(value)
      return {
        ...prev,
        serviceCategories: exists
          ? prev.serviceCategories.filter(item => item !== value)
          : [...prev.serviceCategories, value],
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col">
        <DrawerHeader className="border-b border-border/50 ui-density-page">
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>
              {t('venueUi.suppliers.filters.title', { defaultValue: 'Фильтры поставщиков' })}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={onReset}>
                {t('common.reset', { defaultValue: 'Сбросить' })}
              </Button>
              <DrawerCloseButton
                onClick={() => onOpenChange(false)}
                ariaLabel={t('common.close')}
              />
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 ui-density-stack-lg overflow-y-auto ui-density-page ui-density-py">
          <div className="ui-density-stack-sm">
            <p className="text-sm font-medium">{t('profile.city', { defaultValue: 'Город' })}</p>
            <CitySelect
              value={draftFilters.city}
              onChange={value => setDraftFilters(prev => ({ ...prev, city: value }))}
              options={cities}
              disabled={isCitiesLoading}
              placeholder={t('venueUi.suppliers.filters.cityPlaceholder', {
                defaultValue: 'Например, Минск',
              })}
            />
          </div>
          <div className="ui-density-stack-sm">
            <p className="text-sm font-medium">
              {t('venueUi.suppliers.filters.type', { defaultValue: 'Тип поставщика' })}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={draftFilters.supplierType === null ? 'primary' : 'outline'}
                onClick={() => setDraftFilters(prev => ({ ...prev, supplierType: null }))}
              >
                {t('common.all', { defaultValue: 'Все' })}
              </Button>
              {supplierTypeOptions.map(value => (
                <Button
                  key={value}
                  size="sm"
                  variant={draftFilters.supplierType === value ? 'primary' : 'outline'}
                  onClick={() => setDraftFilters(prev => ({ ...prev, supplierType: value }))}
                >
                  {getSupplierTypeLabel(value)}
                </Button>
              ))}
            </div>
          </div>

          <div className="ui-density-stack-sm">
            <p className="text-sm font-medium">
              {t('venueUi.suppliers.filters.categories', { defaultValue: 'Категории услуг' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {serviceCategoryOptions.map(value => (
                <Button
                  key={value}
                  size="sm"
                  variant={draftFilters.serviceCategories.includes(value) ? 'primary' : 'outline'}
                  onClick={() => toggleDraftServiceCategory(value)}
                >
                  {t(`labels.supplierType.${value}`, {
                    defaultValue: formatServiceCategory(value),
                  })}
                </Button>
              ))}
            </div>
          </div>

          <div className="ui-density-stack-sm">
            <p className="text-sm font-medium">
              {t('venueUi.suppliers.filters.delivery', { defaultValue: 'Доставка' })}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={draftFilters.delivery === 'all' ? 'primary' : 'outline'}
                onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'all' }))}
              >
                {t('common.all', { defaultValue: 'Все' })}
              </Button>
              <Button
                size="sm"
                variant={draftFilters.delivery === 'yes' ? 'primary' : 'outline'}
                onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'yes' }))}
              >
                {t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })}
              </Button>
              <Button
                size="sm"
                variant={draftFilters.delivery === 'no' ? 'primary' : 'outline'}
                onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'no' }))}
              >
                {t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })}
              </Button>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border/50 bg-background ui-density-page ui-density-py-sm">
          <Button variant="gradient" size="md" className="w-full" onClick={onApply}>
            {t('venueUi.suppliers.filters.apply', { defaultValue: 'Показать поставщиков' })}
          </Button>
        </DrawerFooter>
      </div>
    </Drawer>
  )
}

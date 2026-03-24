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
import { DRAWER_FOOTER_CLASS, DRAWER_HEADER_CLASS } from '@/components/ui/ui-patterns'
import { formatServiceCategory } from '@/components/ui/shift-details-screen/formatServiceCategory'
import { getValidSupplierTypesForCategory, type SupplierFilters } from './types'

interface VenueSuppliersFiltersDrawerProps {
  mode?: 'suppliers' | 'restaurants'
  open: boolean
  onOpenChange: (open: boolean) => void
  draftFilters: SupplierFilters
  setDraftFilters: Dispatch<SetStateAction<SupplierFilters>>
  supplierTypeOptions?: string[]
  serviceCategoryOptions?: string[]
  restaurantFormatOptions?: string[]
  cuisineTypeOptions?: string[]
  cities: string[]
  isCitiesLoading: boolean
  getSupplierTypeLabel: (value: string) => string
  getRestaurantFormatLabel?: (value: string) => string
  getCuisineTypeLabel?: (value: string) => string
  onApply: () => void
  onReset: () => void
}

export const VenueSuppliersFiltersDrawer = ({
  mode = 'suppliers',
  open,
  onOpenChange,
  draftFilters,
  setDraftFilters,
  supplierTypeOptions = [],
  serviceCategoryOptions = [],
  restaurantFormatOptions = [],
  cuisineTypeOptions = [],
  cities,
  isCitiesLoading,
  getSupplierTypeLabel,
  getRestaurantFormatLabel,
  getCuisineTypeLabel,
  onApply,
  onReset,
}: VenueSuppliersFiltersDrawerProps) => {
  const { t } = useTranslation()
  const isRestaurantsMode = mode === 'restaurants'

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

  const toggleDraftRestaurantFormat = (value: string) => {
    setDraftFilters(prev => {
      const exists = prev.restaurantFormats.includes(value)
      return {
        ...prev,
        restaurantFormats: exists
          ? prev.restaurantFormats.filter(item => item !== value)
          : [...prev.restaurantFormats, value],
      }
    })
  }

  const toggleDraftCuisineType = (value: string) => {
    setDraftFilters(prev => {
      const exists = prev.cuisineTypes.includes(value)
      return {
        ...prev,
        cuisineTypes: exists
          ? prev.cuisineTypes.filter(item => item !== value)
          : [...prev.cuisineTypes, value],
      }
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-1 flex-col">
        <DrawerHeader className={DRAWER_HEADER_CLASS}>
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>
              {isRestaurantsMode
                ? t('supplierUi.restaurants.filters.title', { defaultValue: 'Фильтры заведений' })
                : t('venueUi.suppliers.filters.title', { defaultValue: 'Фильтры поставщиков' })}
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
          {!isRestaurantsMode && (
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
                    onClick={() =>
                      setDraftFilters(prev => ({
                        ...prev,
                        supplierType: value,
                        serviceCategories: getValidSupplierTypesForCategory(
                          value,
                          prev.serviceCategories
                        ),
                      }))
                    }
                  >
                    {getSupplierTypeLabel(value)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isRestaurantsMode && (
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
          )}

          {!isRestaurantsMode && (
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
          )}

          {isRestaurantsMode && (
            <div className="ui-density-stack-sm">
              <p className="text-sm font-medium">
                {t('supplierUi.restaurants.filters.format', { defaultValue: 'Формат заведения' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {restaurantFormatOptions.map(value => (
                  <Button
                    key={value}
                    size="sm"
                    variant={draftFilters.restaurantFormats.includes(value) ? 'primary' : 'outline'}
                    onClick={() => toggleDraftRestaurantFormat(value)}
                  >
                    {getRestaurantFormatLabel?.(value) ?? value}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isRestaurantsMode && (
            <div className="ui-density-stack-sm">
              <p className="text-sm font-medium">
                {t('supplierUi.restaurants.filters.cuisines', { defaultValue: 'Кухни' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {cuisineTypeOptions.map(value => (
                  <Button
                    key={value}
                    size="sm"
                    variant={draftFilters.cuisineTypes.includes(value) ? 'primary' : 'outline'}
                    onClick={() => toggleDraftCuisineType(value)}
                  >
                    {getCuisineTypeLabel?.(value) ?? value}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className={DRAWER_FOOTER_CLASS}>
          <Button variant="gradient" size="md" className="w-full" onClick={onApply}>
            {isRestaurantsMode
              ? t('supplierUi.restaurants.filters.apply', { defaultValue: 'Показать заведения' })
              : t('venueUi.suppliers.filters.apply', { defaultValue: 'Показать поставщиков' })}
          </Button>
        </DrawerFooter>
      </div>
    </Drawer>
  )
}

import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectableTagButton } from '@/shared/ui/SelectableTagButton'
import { CityAutocompleteField } from '@/components/ui/city-autocomplete-field'
import { formatServiceCategory } from '@/shared/utils/formatServiceCategory'
import { ExpandableTagList } from '@/shared/ui/ExpandableTagList'
import { CatalogFiltersDrawerShell } from '@/shared/ui/CatalogFiltersDrawerShell'
import { PROFILE_SECTION_LABEL_CLASS } from '@/components/ui/ui-patterns'
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
    <CatalogFiltersDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title={
        isRestaurantsMode
          ? t('supplierUi.restaurants.filters.title', { defaultValue: 'Фильтры заведений' })
          : t('venueUi.suppliers.filters.title', { defaultValue: 'Фильтры поставщиков' })
      }
      applyLabel={
        isRestaurantsMode
          ? t('supplierUi.restaurants.filters.apply', { defaultValue: 'Показать заведения' })
          : t('venueUi.suppliers.filters.apply', { defaultValue: 'Показать поставщиков' })
      }
      onApply={onApply}
      onReset={onReset}
      frameClassName="flex-1"
      applyVariant="gradient"
    >
      {!isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('venueUi.suppliers.filters.type', { defaultValue: 'Тип поставщика' })}
          </p>
          <div className="flex flex-wrap gap-2">
            <SelectableTagButton
              value="all"
              label={t('common.all', { defaultValue: 'Все' })}
              isSelected={draftFilters.supplierType === null}
              onClick={() => setDraftFilters(prev => ({ ...prev, supplierType: null }))}
            />
            {supplierTypeOptions.map(value => (
              <SelectableTagButton
                key={value}
                value={value}
                label={getSupplierTypeLabel(value)}
                isSelected={draftFilters.supplierType === value}
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
              />
            ))}
          </div>
        </div>
      )}

      {!isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('venueUi.suppliers.filters.categories', { defaultValue: 'Категории услуг' })}
          </p>
          <ExpandableTagList
            items={serviceCategoryOptions}
            getKey={value => value}
            priorityKeys={draftFilters.serviceCategories}
            renderItem={value => (
              <SelectableTagButton
                value={value}
                label={t(`labels.supplierType.${value}`, {
                  defaultValue: formatServiceCategory(value),
                })}
                isSelected={draftFilters.serviceCategories.includes(value)}
                onClick={() => toggleDraftServiceCategory(value)}
              />
            )}
          />
        </div>
      )}

      {!isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('venueUi.suppliers.showActive', { defaultValue: 'Только активные' })}
          </p>
          <div className="flex flex-wrap gap-2">
            <SelectableTagButton
              value="all"
              label={t('common.all', { defaultValue: 'Все' })}
              isSelected={!draftFilters.onlyActive}
              onClick={() => setDraftFilters(prev => ({ ...prev, onlyActive: false }))}
            />
            <SelectableTagButton
              value="active"
              label={t('venueUi.suppliers.showActive', { defaultValue: 'Только активные' })}
              isSelected={draftFilters.onlyActive}
              onClick={() => setDraftFilters(prev => ({ ...prev, onlyActive: true }))}
            />
          </div>
        </div>
      )}

      {!isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('venueUi.suppliers.filters.delivery', { defaultValue: 'Доставка' })}
          </p>
          <div className="flex flex-wrap gap-2">
            <SelectableTagButton
              value="all"
              label={t('common.all', { defaultValue: 'Все' })}
              isSelected={draftFilters.delivery === 'all'}
              onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'all' }))}
            />
            <SelectableTagButton
              value="yes"
              label={t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })}
              isSelected={draftFilters.delivery === 'yes'}
              onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'yes' }))}
            />
            <SelectableTagButton
              value="no"
              label={t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })}
              isSelected={draftFilters.delivery === 'no'}
              onClick={() => setDraftFilters(prev => ({ ...prev, delivery: 'no' }))}
            />
          </div>
        </div>
      )}

      {isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('supplierUi.restaurants.filters.format', { defaultValue: 'Формат заведения' })}
          </p>
          <ExpandableTagList
            items={restaurantFormatOptions}
            getKey={value => value}
            priorityKeys={draftFilters.restaurantFormats}
            renderItem={value => (
              <SelectableTagButton
                value={value}
                label={getRestaurantFormatLabel?.(value) ?? value}
                isSelected={draftFilters.restaurantFormats.includes(value)}
                onClick={() => toggleDraftRestaurantFormat(value)}
              />
            )}
          />
        </div>
      )}

      {isRestaurantsMode && (
        <div className="ui-density-stack">
          <p className={PROFILE_SECTION_LABEL_CLASS}>
            {t('supplierUi.restaurants.filters.cuisines', { defaultValue: 'Кухни' })}
          </p>
          <ExpandableTagList
            items={cuisineTypeOptions}
            getKey={value => value}
            priorityKeys={draftFilters.cuisineTypes}
            renderItem={value => (
              <SelectableTagButton
                value={value}
                label={getCuisineTypeLabel?.(value) ?? value}
                isSelected={draftFilters.cuisineTypes.includes(value)}
                onClick={() => toggleDraftCuisineType(value)}
              />
            )}
          />
        </div>
      )}

      <CityAutocompleteField
        label={t('profile.city', { defaultValue: 'Город' })}
        value={draftFilters.city}
        onChange={value => setDraftFilters(prev => ({ ...prev, city: value }))}
        options={cities}
        disabled={isCitiesLoading}
        isLoading={isCitiesLoading}
        placeholder={t('venueUi.suppliers.filters.cityPlaceholder', {
          defaultValue: 'Например, Минск',
        })}
        showLocationButton={false}
        validateOnBlur={false}
      />
    </CatalogFiltersDrawerShell>
  )
}

/**
 * Barrel‑файл: исторический путь импорта `BusinessStructuredFields` сохранён.
 * Реальные компоненты живут рядом, в `business-fields/`.
 *
 * Зачем: внешние потребители (`EditProfileDrawer`, `BusinessFieldsSection` и т.д.)
 * импортируют по этому пути — barrel обеспечивает обратную совместимость.
 */
export { BusinessAddressesField } from './business-fields/BusinessAddressesField'
export { BusinessHoursField } from './business-fields/BusinessHoursField'

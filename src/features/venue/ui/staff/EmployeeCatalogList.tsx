import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CatalogListShell } from '@/shared/ui/CatalogListShell'
import { ApplicantPreviewCard } from '@/shared/ui/shift-details-screen/ApplicantPreviewCard'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { mapEmployeeCatalogItemToApplicationPreview } from './employeeCatalogMappers'
import { STAFF_INVITE_ENABLED, type EmployeeCatalogItem } from './employeeCatalogTypes'

interface EmployeeCatalogListProps {
  activeFilters: ActiveFilterItem[]
  onResetFilters: () => void
  onRemoveFilter: (id: string) => void
  isLoading: boolean
  isFetching: boolean
  employees: EmployeeCatalogItem[]
  hasMore: boolean
  onLoadMore: () => void
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
  onOpenProfile: (userId: number) => void
  onInvite: (employee: EmployeeCatalogItem) => void
  onRefresh?: () => Promise<unknown> | void
  refreshDisabled?: boolean
}

export const EmployeeCatalogList = ({
  activeFilters,
  onResetFilters,
  onRemoveFilter,
  isLoading,
  isFetching,
  employees,
  hasMore,
  onLoadMore,
  getEmployeePositionLabel,
  getSpecializationLabel,
  onOpenProfile,
  onInvite,
  onRefresh,
  refreshDisabled,
}: EmployeeCatalogListProps) => {
  const { t } = useTranslation()

  // Маппим один раз на изменение списка, а не на каждый рендер.
  const cards = useMemo(
    () =>
      employees.map(employee => ({
        employee,
        applicant: mapEmployeeCatalogItemToApplicationPreview(employee),
      })),
    [employees]
  )
  const resolvePositionLabel = useCallback(
    (value?: string | null) => getEmployeePositionLabel(value ?? ''),
    [getEmployeePositionLabel]
  )

  return (
    <CatalogListShell
      activeFilters={activeFilters}
      onResetFilters={onResetFilters}
      onRemoveFilter={onRemoveFilter}
      isLoading={isLoading}
      itemsCount={employees.length}
      isEmpty={employees.length === 0}
      skeletonVariant="staff"
      emptyMessage={t('venueUi.staff.catalog.emptyTitle', {
        defaultValue: 'Сотрудники не найдены',
      })}
      emptyDescription={t('venueUi.staff.catalog.emptyDescription', {
        defaultValue: 'Измените фильтры или попробуйте обновить список',
      })}
      emptyImage="shift-applicants"
      hasMore={hasMore}
      isFetching={isFetching}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      refreshDisabled={refreshDisabled}
    >
      <div className="ui-density-stack">
        {cards.map(({ employee, applicant }) => (
          <ApplicantPreviewCard
            key={employee.id}
            applicant={applicant}
            getEmployeePositionLabel={resolvePositionLabel}
            getSpecializationLabel={getSpecializationLabel}
            onSelect={onOpenProfile}
            t={t}
            variant="catalog"
            onInvite={STAFF_INVITE_ENABLED ? () => onInvite(employee) : undefined}
          />
        ))}
      </div>
    </CatalogListShell>
  )
}

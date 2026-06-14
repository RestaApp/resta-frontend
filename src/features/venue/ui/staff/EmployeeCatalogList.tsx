import { useTranslation } from 'react-i18next'
import { CatalogListShell } from '@/shared/ui/CatalogListShell'
import { ApplicantPreviewCard } from '@/shared/ui/shift-details-screen/ApplicantPreviewCard'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { mapEmployeeCatalogItemToApplicationPreview } from './employeeCatalogMappers'
import type { EmployeeCatalogItem } from './employeeCatalogTypes'

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
}: EmployeeCatalogListProps) => {
  const { t } = useTranslation()

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
    >
      <div className="ui-density-stack">
        {employees.map(employee => (
          <ApplicantPreviewCard
            key={employee.id}
            applicant={mapEmployeeCatalogItemToApplicationPreview(employee)}
            getEmployeePositionLabel={value => getEmployeePositionLabel(value ?? '')}
            getSpecializationLabel={getSpecializationLabel}
            onSelect={userId => onOpenProfile(userId)}
            t={t}
            variant="catalog"
            onInvite={() => onInvite(employee)}
          />
        ))}
      </div>
    </CatalogListShell>
  )
}

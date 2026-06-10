import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/states'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { APP_HEADER_ACTION_BUTTON_CLASS, APP_HEADER_ACTION_ICON_CLASS } from '@/components/ui/ui-patterns'
import { InfiniteScrollTrigger } from '@/shared/ui/InfiniteScrollTrigger'
import { SearchFilters } from '@/shared/ui/SearchFilters'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { Toast } from '@/components/ui/toast'
import { cn } from '@/shared/utils/cn'
import { ApplicantPreviewCard } from '@/shared/ui/shift-details-screen/ApplicantPreviewCard'
import { mapEmployeeCatalogItemToApplicationPreview } from './employeeCatalogMappers'
import { EmployeeCatalogFiltersDrawer } from './EmployeeCatalogFiltersDrawer'
import { EmployeeInviteDrawer } from './EmployeeInviteDrawer'
import { useEmployeeCatalogModel } from './useEmployeeCatalogModel'

export const EmployeeCatalogDrawer = () => {
  const { t } = useTranslation()
  const m = useEmployeeCatalogModel()

  return (
    <>
      <Drawer open={m.isCatalogOpen} onOpenChange={m.setIsCatalogOpen}>
        <DrawerFrame>
          <DrawerHeader>
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle>
                {t('venueUi.staff.catalog.title', { defaultValue: 'Каталог сотрудников' })}
              </DrawerTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={t('venueUi.staff.catalog.filters.openAria', {
                    defaultValue: 'Фильтры сотрудников',
                  })}
                  className={cn(APP_HEADER_ACTION_BUTTON_CLASS)}
                  onClick={m.handleOpenFilters}
                >
                  <SlidersHorizontal className={APP_HEADER_ACTION_ICON_CLASS} />
                </Button>
                <DrawerCloseButton
                  onClick={() => m.setIsCatalogOpen(false)}
                  ariaLabel={t('common.close', { defaultValue: 'Закрыть' })}
                />
              </div>
            </div>
          </DrawerHeader>

          <SearchFilters
            activeFilters={m.activeFilters}
            onResetFilters={m.handleResetFilters}
            onRemoveFilter={m.handleRemoveFilter}
          />

          <DrawerBody className="ui-density-page ui-density-py">
            {m.isError ? (
              <ErrorState
                title={t('venueUi.staff.catalog.loadError', {
                  defaultValue: 'Не удалось загрузить сотрудников',
                })}
                onRetry={() => void m.refetch()}
                retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
              />
            ) : m.isLoading && m.employeesCount === 0 ? (
              <FeedCardSkeletonList variant="staff" className="ui-density-stack" />
            ) : m.employees.length === 0 ? (
              <EmptyState
                image="shift-applicants"
                message={t('venueUi.staff.catalog.emptyTitle', {
                  defaultValue: 'Сотрудники не найдены',
                })}
                description={t('venueUi.staff.catalog.emptyDescription', {
                  defaultValue: 'Измените фильтры или попробуйте обновить список',
                })}
              />
            ) : (
              <>
                <div className="ui-density-stack">
                  {m.employees.map(employee => (
                    <ApplicantPreviewCard
                      key={employee.id}
                      applicant={mapEmployeeCatalogItemToApplicationPreview(employee)}
                      getEmployeePositionLabel={m.getEmployeePositionLabel}
                      getSpecializationLabel={m.getSpecializationLabel}
                      onSelect={userId => m.handleOpenProfile(userId)}
                      t={t}
                      variant="catalog"
                      onInvite={() => m.handleOpenInvite(employee)}
                    />
                  ))}
                </div>
                <InfiniteScrollTrigger
                  onLoadMore={m.handleLoadMore}
                  hasMore={m.hasMore}
                  isLoading={m.isFetching}
                  isError={false}
                />
              </>
            )}
          </DrawerBody>
        </DrawerFrame>
      </Drawer>

      <EmployeeCatalogFiltersDrawer
        open={m.isFiltersOpen}
        onOpenChange={m.setIsFiltersOpen}
        draftFilters={m.draftFilters}
        setDraftFilters={m.setDraftFilters}
        cities={m.cities}
        isCitiesLoading={m.isCitiesLoading}
        positions={m.positions}
        specializations={m.specializations}
        getEmployeePositionLabel={m.getEmployeePositionLabel}
        getSpecializationLabel={m.getSpecializationLabel}
        onApply={m.handleApplyFilters}
        onReset={m.handleResetDraftFilters}
      />

      <EmployeeInviteDrawer
        open={m.isInviteOpen}
        employee={m.inviteEmployee}
        vacancies={m.inviteableVacancies}
        invitingShiftId={m.invitingShiftId}
        onClose={m.handleCloseInvite}
        onInvite={m.handleInvite}
        getEmployeePositionLabel={m.getEmployeePositionLabel}
        getSpecializationLabel={m.getSpecializationLabel}
      />

      <UserProfileDrawer
        userId={m.selectedProfileId}
        open={m.selectedProfileId !== null}
        onClose={m.handleCloseProfile}
      />

      <Toast
        message={m.toast.message}
        type={m.toast.type}
        isVisible={m.toast.isVisible}
        onClose={m.hideToast}
      />
    </>
  )
}

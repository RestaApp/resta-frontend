import { useMemo } from 'react'
import { Briefcase, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/section-header'
import { OwnerListingCardWithInvite } from '@/components/ui/shift-card/OwnerListingCard'
import { partitionListingsByShiftType } from '@/shared/shifts/mapping'
import type { EmployeeCatalogItem } from './employeeCatalogTypes'

interface EmployeeInviteDrawerProps {
  open: boolean
  employee: EmployeeCatalogItem | null
  vacancies: VacancyApiItem[]
  invitingShiftId: number | null
  onClose: () => void
  onInvite: (vacancy: VacancyApiItem) => void
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
}

export const EmployeeInviteDrawer = ({
  open,
  employee,
  vacancies,
  invitingShiftId,
  onClose,
  onInvite,
  getEmployeePositionLabel,
  getSpecializationLabel,
}: EmployeeInviteDrawerProps) => {
  const { t } = useTranslation()

  const title = useMemo(() => {
    if (!employee) {
      return t('venueUi.staff.catalog.inviteTitle', { defaultValue: 'Пригласить' })
    }
    return t('venueUi.staff.catalog.inviteTitleFor', {
      name: employee.name,
      defaultValue: 'Пригласить {{name}}',
    })
  }, [employee, t])

  const { replacements: replacementShifts, vacancies: vacancyListings } = useMemo(
    () => partitionListingsByShiftType(vacancies),
    [vacancies]
  )

  const inviteToShiftLabel = t('venueUi.staff.catalog.inviteToShift', {
    defaultValue: 'Пригласить на эту смену',
  })

  const inviteToVacancyLabel = t('venueUi.staff.catalog.inviteToVacancy', {
    defaultValue: 'Пригласить на эту вакансию',
  })

  const sharedCardProps = {
    invitingShiftId,
    onInvite,
    getEmployeePositionLabel,
    getSpecializationLabel,
  }

  return (
    <Drawer open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DrawerFrame>
        <DrawerHeader>
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerCloseButton
              onClick={onClose}
              ariaLabel={t('common.close', { defaultValue: 'Закрыть' })}
            />
          </div>
        </DrawerHeader>

        <DrawerBody className="ui-density-stack">
          {vacancies.length === 0 ? (
            <EmptyState
              image="shift-applicants"
              message={t('venueUi.staff.catalog.noOpenListingsTitle', {
                defaultValue: 'Нет открытых смен и вакансий',
              })}
              description={t('venueUi.staff.catalog.noOpenListingsDescription', {
                defaultValue:
                  'Создайте смену или вакансию в разделе «Активность», чтобы пригласить сотрудника',
              })}
            />
          ) : (
            <div className="ui-density-stack">
              {replacementShifts.length > 0 ? (
                <section className="ui-density-stack">
                  <SectionHeader
                    icon={Clock3}
                    title={t('tabs.feed.shifts')}
                    count={replacementShifts.length}
                  />
                  <div className="ui-density-stack">
                    {replacementShifts.map(listing => (
                      <OwnerListingCardWithInvite
                        key={listing.id}
                        listing={listing}
                        inviteLabel={inviteToShiftLabel}
                        {...sharedCardProps}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {vacancyListings.length > 0 ? (
                <section className="ui-density-stack">
                  <SectionHeader
                    icon={Briefcase}
                    title={t('tabs.feed.jobs')}
                    count={vacancyListings.length}
                  />
                  <div className="ui-density-stack">
                    {vacancyListings.map(listing => (
                      <OwnerListingCardWithInvite
                        key={listing.id}
                        listing={listing}
                        inviteLabel={inviteToVacancyLabel}
                        {...sharedCardProps}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
}

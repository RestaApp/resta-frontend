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
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/section-header'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import {
  formatOwnerShiftScheduleLine,
  getOwnerShiftTitle,
} from '@/shared/shifts/ownerShiftDisplay'
import { cn } from '@/shared/utils/cn'
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

interface InviteListingCardProps {
  listing: VacancyApiItem
  invitingShiftId: number | null
  inviteLabel: string
  onInvite: (vacancy: VacancyApiItem) => void
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
}

const InviteListingCard = ({
  listing,
  invitingShiftId,
  inviteLabel,
  onInvite,
  getEmployeePositionLabel,
  getSpecializationLabel,
}: InviteListingCardProps) => {
  const positionLabel = getEmployeePositionLabel(listing.position ?? '')
  const specializationLabel = listing.specialization
    ? getSpecializationLabel(listing.specialization)
    : listing.specializations?.[0]
      ? getSpecializationLabel(listing.specializations[0])
      : null
  const listingTitle = getOwnerShiftTitle(listing, positionLabel, specializationLabel)
  const schedule = formatOwnerShiftScheduleLine(listing.start_time, listing.end_time)
  const isLoading = invitingShiftId === listing.id

  return (
    <div className={cn(SHIFT_CARD_CLASS, 'ui-density-stack')}>
      <div>
        <p className={SHIFT_CARD_TITLE_CLASS}>{listingTitle}</p>
        {schedule ? <p className={SHIFT_CARD_SUB_CLASS}>{schedule}</p> : null}
      </div>
      <Button
        type="button"
        size="sm"
        className="w-full"
        loading={isLoading}
        onClick={() => onInvite(listing)}
      >
        {inviteLabel}
      </Button>
    </div>
  )
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

  const replacementShifts = useMemo(
    () => vacancies.filter(item => item.shift_type !== 'vacancy'),
    [vacancies]
  )

  const vacancyListings = useMemo(
    () => vacancies.filter(item => item.shift_type === 'vacancy'),
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
                      <InviteListingCard
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
                      <InviteListingCard
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

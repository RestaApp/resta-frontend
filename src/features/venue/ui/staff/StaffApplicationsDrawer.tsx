import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { ErrorState } from '@/components/ui/states'
import { VenueStaffList, type StaffItem } from './VenueStaffList'

interface StaffApplicationsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  items: StaffItem[]
  isAccepting: boolean
  acceptingApplicationId: number | null
  onAccept: (applicationId: number, shiftId: number) => void
  onSelectApplicant: (userId: number, applicationId: number | null, shiftId: number) => void
  onOpenShiftDetails: (shiftId: number) => void
}

export const StaffApplicationsDrawer = ({
  open,
  onOpenChange,
  isLoading,
  isError,
  onRetry,
  items,
  isAccepting,
  acceptingApplicationId,
  onAccept,
  onSelectApplicant,
  onOpenShiftDetails,
}: StaffApplicationsDrawerProps) => {
  const { t } = useTranslation()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame>
        <DrawerTitleBar
          title={t('venueUi.staff.applications.title', { defaultValue: 'Отклики' })}
          onClose={() => onOpenChange(false)}
        />

        <DrawerBody className="p-0">
          {isError ? (
            <ErrorState
              title={t('venueUi.staff.applications.loadError', {
                defaultValue: 'Не удалось загрузить отклики',
              })}
              onRetry={onRetry}
              retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
            />
          ) : (
            <VenueStaffList
              isLoading={isLoading}
              items={items}
              isAccepting={isAccepting}
              acceptingApplicationId={acceptingApplicationId}
              onAccept={onAccept}
              onSelectApplicant={onSelectApplicant}
              onOpenShiftDetails={onOpenShiftDetails}
            />
          )}
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
}

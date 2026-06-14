import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VenueStaffList, type StaffItem } from './VenueStaffList'

interface StaffApplicationsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
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
        <DrawerHeader>
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle>
              {t('venueUi.staff.applications.title', { defaultValue: 'Отклики' })}
            </DrawerTitle>
            <DrawerCloseButton
              onClick={() => onOpenChange(false)}
              ariaLabel={t('common.close', { defaultValue: 'Закрыть' })}
            />
          </div>
        </DrawerHeader>

        <DrawerBody className="p-0">
          <VenueStaffList
            isLoading={isLoading}
            items={items}
            isAccepting={isAccepting}
            acceptingApplicationId={acceptingApplicationId}
            onAccept={onAccept}
            onSelectApplicant={onSelectApplicant}
            onOpenShiftDetails={onOpenShiftDetails}
          />
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
}

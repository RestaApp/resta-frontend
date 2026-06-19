import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'
import { ProfileOverview } from './components/ProfileOverview'
import { ProfileSkeleton } from '@/components/ui/profile-skeleton'
import { ErrorState } from '@/components/ui/states'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useExternalProfileViewModel } from './useExternalProfileViewModel'

interface UserProfileDrawerProps {
  userId: number | null
  open: boolean
  onClose: () => void
  applicationId?: number | null
  canModerate?: boolean
  /** Статус заявки: hire — только при 'pending'; reject — при 'pending' и 'accepted' */
  applicationStatus?: 'pending' | 'accepted' | 'rejected'
  moderatingAction?: 'accept' | 'reject' | null
  onAccept?: () => Promise<void>
  onReject?: () => Promise<void>
}

export const UserProfileDrawer = memo(
  ({
    userId,
    open,
    onClose,
    applicationId = null,
    canModerate = false,
    applicationStatus = 'pending',
    moderatingAction = null,
    onAccept,
    onReject,
  }: UserProfileDrawerProps) => {
    const { t } = useTranslation()
    const { profileViewModel, isLoading, isError, drawerTitle } = useExternalProfileViewModel({
      userId,
      skip: !open,
    })

    const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)

    const handleClose = () => {
      setRejectConfirmOpen(false)
      onClose()
    }

    const canReject =
      canModerate &&
      typeof applicationId === 'number' &&
      Boolean(onReject) &&
      applicationStatus !== 'rejected'
    const canAccept =
      canModerate &&
      typeof applicationId === 'number' &&
      Boolean(onAccept) &&
      applicationStatus === 'pending'
    const showModerationActions = canReject || canAccept

    return (
      <>
        <Drawer open={open} onOpenChange={isOpen => !isOpen && handleClose()}>
          <DrawerFrame className="flex-1">
            <DrawerTitleBar title={drawerTitle} onClose={handleClose} />

            <DrawerBody className="ui-density-stack">
              {isLoading ? (
                <ProfileSkeleton variant="drawer" />
              ) : isError ? (
                <ErrorState title={t('errors.loadError')} className="min-h-0 py-10" />
              ) : profileViewModel ? (
                <ProfileOverview profile={profileViewModel} variant="drawer" />
              ) : null}
            </DrawerBody>

            {showModerationActions ? (
              <DrawerFooter contentClassName="grid grid-cols-2 gap-3">
                {canReject ? (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    loading={moderatingAction === 'reject'}
                    disabled={moderatingAction != null}
                    onClick={() => setRejectConfirmOpen(true)}
                  >
                    {moderatingAction === 'reject'
                      ? t('shift.rejectingApplication')
                      : t('shift.rejectApplication')}
                  </Button>
                ) : null}
                {canAccept ? (
                  <Button
                    variant="gradient"
                    size="md"
                    className="w-full"
                    loading={moderatingAction === 'accept'}
                    disabled={moderatingAction != null}
                    onClick={onAccept}
                  >
                    {moderatingAction === 'accept'
                      ? t('shift.acceptingApplication')
                      : t('shift.acceptApplication')}
                  </Button>
                ) : null}
              </DrawerFooter>
            ) : null}
          </DrawerFrame>
        </Drawer>

        {canReject && onReject ? (
          <ConfirmDialog
            open={rejectConfirmOpen}
            onOpenChange={setRejectConfirmOpen}
            title={t('shift.rejectApplicationConfirmTitle')}
            description={t('shift.rejectApplicationConfirmDescription')}
            cancelLabel={t('common.cancel')}
            confirmLabel={t('shift.rejectApplication')}
            confirmVariant="destructive"
            onConfirm={() => {
              void (async () => {
                setRejectConfirmOpen(false)
                await onReject()
              })()
            }}
          />
        ) : null}
      </>
    )
  }
)

UserProfileDrawer.displayName = 'UserProfileDrawer'

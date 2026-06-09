import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerCloseButton,
  DrawerFrame,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { ProfileOverview } from './components/ProfileOverview'
import { Loader } from '@/components/ui/loader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useExternalProfileViewModel } from '../model/hooks/useExternalProfileViewModel'

interface UserProfileDrawerProps {
  userId: number | null
  open: boolean
  onClose: () => void
  applicationId?: number | null
  canModerate?: boolean
  /** Статус заявки: при 'accepted' показывается только кнопка «Отклонить» */
  applicationStatus?: 'pending' | 'accepted'
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

    const canReject = canModerate && typeof applicationId === 'number' && Boolean(onReject)
    const canAccept =
      canModerate &&
      typeof applicationId === 'number' &&
      Boolean(onAccept) &&
      applicationStatus !== 'accepted'
    const showModerationActions = canReject || canAccept

    return (
      <>
        <Drawer open={open} onOpenChange={isOpen => !isOpen && handleClose()}>
          <DrawerFrame className="flex-1">
            <DrawerHeader>
              <div className="flex items-center justify-between gap-2">
                <DrawerTitle>{drawerTitle}</DrawerTitle>
                <DrawerCloseButton onClick={handleClose} ariaLabel={t('common.close')} />
              </div>
            </DrawerHeader>

            <DrawerBody className="ui-density-stack">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader size="lg" />
                </div>
              ) : isError ? (
                <div className="text-center py-10 text-muted-foreground">
                  {t('errors.loadError')}
                </div>
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

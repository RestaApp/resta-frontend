import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/ui/inline-alert'

interface DeleteAccountDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleteConfirmed: () => Promise<void>
}

export const DeleteAccountDrawer = memo(function DeleteAccountDrawer({
  open,
  onOpenChange,
  onDeleteConfirmed,
}: DeleteAccountDrawerProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onDeleteConfirmed()
      setShowConfirm(false)
      onOpenChange(false)
    } catch {
      setError(t('legal.deleteAccount.error'))
    } finally {
      setIsDeleting(false)
    }
  }, [onDeleteConfirmed, onOpenChange, t])

  const handleClose = useCallback(
    (next: boolean) => {
      if (!next) {
        setShowConfirm(false)
        setError(null)
      }
      onOpenChange(next)
    },
    [onOpenChange]
  )

  return (
    <>
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerFrame className="flex-1">
          <DrawerHeader>
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle>{t('legal.deleteAccount.title')}</DrawerTitle>
              <DrawerCloseButton onClick={() => handleClose(false)} ariaLabel={t('common.close')} />
            </div>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-4 pt-2">
            <p className="text-sm text-muted-foreground">{t('legal.deleteAccount.description')}</p>

            <ul className="list-disc pl-5 text-sm text-muted-foreground flex flex-col gap-1">
              {(t('legal.deleteAccount.consequencesList', { returnObjects: true }) as string[]).map(
                (item, idx) => (
                  <li key={idx}>{item}</li>
                )
              )}
            </ul>

            {error ? <InlineAlert message={error} /> : null}
          </DrawerBody>

          <DrawerFooter contentClassName="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleClose(false)}
              variant="outline"
              size="md"
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              variant="destructive"
              size="md"
              className="flex-1"
            >
              {t('legal.deleteAccount.deleteButton')}
            </Button>
          </DrawerFooter>
        </DrawerFrame>
      </Drawer>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('legal.deleteAccount.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('legal.deleteAccount.confirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? t('legal.deleteAccount.deleting')
                : t('legal.deleteAccount.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

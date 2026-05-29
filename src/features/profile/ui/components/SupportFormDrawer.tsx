import { useTranslation } from 'react-i18next'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { useSupportTicketForm } from '@/features/profile/model/hooks/useSupportTicketForm'
import { SupportTicketForm } from './SupportTicketForm'

interface SupportFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportFormDrawer({ open, onOpenChange }: SupportFormDrawerProps) {
  const { t } = useTranslation()
  const handleClose = () => onOpenChange(false)
  const form = useSupportTicketForm(handleClose)

  if (form.isSuccess) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerFrame className="flex-1">
          <DrawerHeader>
            <div className="flex items-center justify-between gap-2">
              <DrawerTitle>{t('profile.supportForm.successTitle')}</DrawerTitle>
              <DrawerCloseButton onClick={handleClose} ariaLabel={t('common.close')} />
            </div>
            <DrawerDescription>{t('profile.supportForm.successDescription')}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="gradient" size="md" className="w-full" onClick={form.handleClose}>
              {t('common.understand')}
            </Button>
          </DrawerFooter>
        </DrawerFrame>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame className="flex-1">
        <DrawerHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <DrawerTitle>{t('profile.supportForm.title')}</DrawerTitle>
              <DrawerDescription>{t('profile.supportForm.description')}</DrawerDescription>
            </div>
            <DrawerCloseButton onClick={handleClose} ariaLabel={t('common.close')} />
          </div>
        </DrawerHeader>

        <DrawerBody className="ui-density-stack">
          <SupportTicketForm
            subject={form.subject}
            setSubject={form.setSubject}
            message={form.message}
            setMessage={form.setMessage}
            category={form.category}
            setCategory={form.setCategory}
            contactInfo={form.contactInfo}
            setContactInfo={form.setContactInfo}
            categoryOptions={form.categoryOptions}
            onSubmit={form.handleSubmit}
            errorMessage={form.errorMessage}
            fieldErrors={form.fieldErrors}
            maxMessageLength={form.maxMessageLength}
          />
        </DrawerBody>
        <DrawerFooter>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleClose}
              disabled={form.isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="gradient"
              size="md"
              className="flex-1"
              onClick={form.handleSubmit}
              disabled={form.isLoading}
            >
              {form.isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" />
                  {t('common.saving')}
                </span>
              ) : (
                t('profile.supportForm.submit')
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
}

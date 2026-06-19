import { useTranslation } from 'react-i18next'
import { Drawer, DrawerBody, DrawerFrame, DrawerFooter } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
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
          <DrawerTitleBar
            title={t('profile.supportForm.successTitle')}
            description={t('profile.supportForm.successDescription')}
            onClose={handleClose}
          />
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
        <DrawerTitleBar
          title={t('profile.supportForm.title')}
          description={t('profile.supportForm.description')}
          onClose={handleClose}
        />

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

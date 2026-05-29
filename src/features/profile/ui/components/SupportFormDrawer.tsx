import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
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
import { SHIFT_CARD_LOGO_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/utils/cn'
import { useSupportTicketForm } from '@/features/profile/model/hooks/useSupportTicketForm'
import { SupportTicketForm } from './SupportTicketForm'

interface SupportFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SupportDrawerIcon = () => (
  <div className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-secondary text-primary')}>
    <HelpCircle className="h-5 w-5" />
  </div>
)

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
              <div className="flex items-center gap-3">
                <SupportDrawerIcon />
                <DrawerTitle>{t('profile.supportForm.successTitle')}</DrawerTitle>
              </div>
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
            <div className="flex items-center gap-3">
              <SupportDrawerIcon />
              <div>
                <DrawerTitle>{t('profile.supportForm.title')}</DrawerTitle>
                <DrawerDescription>{t('profile.supportForm.description')}</DrawerDescription>
              </div>
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
            onCancel={handleClose}
            isLoading={form.isLoading}
            errorMessage={form.errorMessage}
            fieldErrors={form.fieldErrors}
            maxMessageLength={form.maxMessageLength}
          />
        </DrawerBody>
      </DrawerFrame>
    </Drawer>
  )
}

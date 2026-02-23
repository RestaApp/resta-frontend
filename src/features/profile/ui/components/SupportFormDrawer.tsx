import { useTranslation } from 'react-i18next'
import { HelpCircle } from 'lucide-react'
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useSupportTicketForm } from '@/features/profile/model/hooks/useSupportTicketForm'
import { SupportTicketForm } from './SupportTicketForm'

interface SupportFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SupportDrawerIcon = () => (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted/50">
    <HelpCircle className="h-6 w-6 text-primary" />
  </div>
)

export function SupportFormDrawer({ open, onOpenChange }: SupportFormDrawerProps) {
  const { t } = useTranslation()
  const handleClose = () => onOpenChange(false)
  const form = useSupportTicketForm(handleClose)

  if (form.isSuccess) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerHeader>
          <div className="flex items-center gap-3">
              <SupportDrawerIcon />
            <DrawerTitle>{t('profile.supportForm.successTitle')}</DrawerTitle>
            </div>
          <DrawerDescription>{t('profile.supportForm.successDescription')}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="gradient" className="w-full rounded-xl" onClick={form.handleClose}>
            {t('common.understand')}
          </Button>
        </DrawerFooter>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader>
        <div className="flex items-center gap-3">
          <SupportDrawerIcon />
          <div>
            <DrawerTitle>{t('profile.supportForm.title')}</DrawerTitle>
            <DrawerDescription>{t('profile.supportForm.description')}</DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <div className="px-4 pb-6">
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
          maxMessageLength={form.maxMessageLength}
        />
      </div>
    </Drawer>
  )
}

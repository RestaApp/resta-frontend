import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './modal'
import { ModalContent } from './modal-content'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string | null
}

export const ErrorModal = memo(function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
}: ErrorModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
        title={title ?? t('errors.saveError')}
        description={message || t('errors.saveErrorDescription')}
        primaryButton={{
          label: t('common.understand'),
          onClick: onClose,
        }}
      />
    </Modal>
  )
})

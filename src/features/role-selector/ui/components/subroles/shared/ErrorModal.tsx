/**
 * Переиспользуемый компонент модального окна ошибки
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/modal'
import { ModalContent } from '@/components/ui/modal-content'
import { AlertTriangle } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string | null
}

export const ErrorModal = memo(function ErrorModal({ isOpen, onClose, message }: ErrorModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
        title={t('errors.saveError')}
        description={message || t('errors.saveErrorDescription')}
        primaryButton={{
          label: t('common.understand'),
          onClick: onClose,
        }}
      />
    </Modal>
  )
})

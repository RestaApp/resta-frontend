/**
 * Переиспользуемый компонент модального окна ошибки
 */

import { memo } from 'react'
import { Modal } from '../../../components/ui/modal'
import { ModalContent } from '../../../components/ui/modal-content'
import { AlertTriangle } from 'lucide-react'
import type { JSX } from 'react'

interface ErrorModalProps {
    isOpen: boolean
    onClose: () => void
    message?: string | null
}

export const ErrorModal = memo(function ErrorModal({
    isOpen,
    onClose,
    message,
}: ErrorModalProps): JSX.Element {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent
                icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
                title="Ошибка сохранения"
                description={message || 'Произошла ошибка при сохранении данных'}
                primaryButton={{
                    label: 'Понятно',
                    onClick: onClose,
                }}
            />
        </Modal>
    )
})



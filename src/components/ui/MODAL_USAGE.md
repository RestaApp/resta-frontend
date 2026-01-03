# Использование модальных окон и Toast

## Компоненты

### Modal
Базовый компонент модального окна с анимацией и backdrop.

### ModalContent
Компонент содержимого модального окна с поддержкой иконки, заголовка, описания и кнопок.

### Toast
Компонент для быстрых уведомлений.

### useToast
Хук для управления Toast уведомлениями.

## Примеры использования

### Success Modal

```tsx
import { Modal, ModalContent } from '@/components/ui'
import { CheckCircle } from 'lucide-react'

const [showModal, setShowModal] = useState(false)

<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <ModalContent
    icon={<CheckCircle className="w-8 h-8 text-green-500" />}
    title="Отклик отправлен!"
    description="Ресторан свяжется с вами в Telegram для уточнения деталей"
    primaryButton={{
      label: 'Отлично!',
      onClick: () => setShowModal(false),
    }}
  />
</Modal>
```

### Confirm Modal

```tsx
import { Modal, ModalContent } from '@/components/ui'
import { Trash2 } from 'lucide-react'

<Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
  <ModalContent
    icon={<Trash2 className="w-8 h-8 text-destructive" />}
    title="Удалить смену?"
    description="Это действие нельзя будет отменить. Все отклики будут потеряны."
    primaryButton={{
      label: 'Да, удалить',
      onClick: () => {
        // Действие
        setShowConfirm(false)
      },
      variant: 'destructive',
    }}
    secondaryButton={{
      label: 'Отмена',
      onClick: () => setShowConfirm(false),
    }}
  />
</Modal>
```

### Error Modal

```tsx
import { Modal, ModalContent } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

<Modal isOpen={showError} onClose={() => setShowError(false)}>
  <ModalContent
    icon={<AlertTriangle className="w-8 h-8 text-orange-500" />}
    title="Ошибка загрузки"
    description="Не удалось загрузить список смен. Проверьте подключение к интернету и попробуйте снова."
    primaryButton={{
      label: 'Повторить',
      onClick: () => {
        // Повторная попытка
        setShowError(false)
      },
    }}
    secondaryButton={{
      label: 'Закрыть',
      onClick: () => setShowError(false),
    }}
  />
</Modal>
```

### Toast уведомления

```tsx
import { Toast } from '@/components/ui'
import { useToast } from '@/hooks'

const { toast, showToast, hideToast } = useToast()

// Показать уведомление
showToast('Смена успешно создана!', 'success')
showToast('Ошибка подключения к серверу', 'error')
showToast('Данные скопированы в буфер обмена', 'info')

// В JSX
<Toast
  message={toast.message}
  type={toast.type}
  isVisible={toast.isVisible}
  onClose={hideToast}
/>
```

## Когда использовать

### Modal (Центральная карточка)
- ✓ Подтверждение важных действий (удаление, отмена)
- ✓ Сообщения об успехе/ошибке с деталями
- ✓ Формы с несколькими полями
- ✗ Простые статусы (используйте Toast)

### Toast (Всплывающее уведомление)
- ✓ Быстрые статусы ("Сохранено", "Скопировано")
- ✓ Ошибки сети (без деталей)
- ✓ Фоновые операции
- ✗ Критичные ошибки (используйте Modal)





# Интеграция с Telegram Web Apps

## Обзор

Приложение адаптировано для работы в Telegram Web Apps. Все кнопки "Назад" удалены, так как Telegram предоставляет встроенную кнопку навигации.

## Что было сделано

1. **Удалены все кнопки "Назад"** из компонентов:
   - ShiftsScreen
   - ApplicationsScreen
   - SettingsScreen
   - CreateShiftScreen
   - NotificationsScreen
   - ChefProfile, WaiterProfile, BartenderProfile

2. **Создан утилитный модуль** `src/utils/telegram.ts` с функциями для работы с Telegram Web Apps API

3. **Добавлена инициализация** Telegram Web App в `main.tsx`

## Использование Telegram Web Apps API

### Инициализация

Приложение автоматически инициализирует Telegram Web App при загрузке:

```typescript
import { initTelegramWebApp } from './utils/telegram'
initTelegramWebApp()
```

### Работа с кнопкой "Назад"

Для управления кнопкой "Назад" в Telegram используйте:

```typescript
import { setupTelegramBackButton, hideTelegramBackButton } from './utils/telegram'

// Показать кнопку "Назад" на определенном экране
useEffect(() => {
  const cleanup = setupTelegramBackButton(() => {
    // Обработчик нажатия
    handleBack()
  })
  
  return cleanup // Скрыть кнопку при размонтировании
}, [])
```

### Проверка окружения

```typescript
import { isTelegramWebApp } from './utils/telegram'

if (isTelegramWebApp()) {
  // Код для Telegram
} else {
  // Код для обычного браузера
}
```

## Подключение скрипта Telegram

В `index.html` должен быть подключен скрипт Telegram Web Apps:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

## Документация

Официальная документация Telegram Web Apps:
- https://core.telegram.org/bots/webapps
- https://core.telegram.org/bots/api#inline-mode

## Основные возможности API

- `BackButton` - управление кнопкой "Назад"
- `MainButton` - главная кнопка внизу экрана
- `HapticFeedback` - тактильная обратная связь
- `themeParams` - параметры темы Telegram
- `initData` - данные пользователя

## Примеры использования

### Получение данных пользователя

```typescript
import { getTelegramWebApp } from './utils/telegram'

const webApp = getTelegramWebApp()
if (webApp) {
  const user = webApp.initDataUnsafe.user
  console.log('Пользователь:', user?.first_name)
}
```

### Тактильная обратная связь

```typescript
import { getTelegramWebApp } from './utils/telegram'

const webApp = getTelegramWebApp()
webApp?.HapticFeedback.impactOccurred('medium')
```

### Главная кнопка

```typescript
import { getTelegramWebApp } from './utils/telegram'

const webApp = getTelegramWebApp()
if (webApp) {
  webApp.MainButton.setText('Отправить')
  webApp.MainButton.show()
  webApp.MainButton.onClick(() => {
    // Обработчик
  })
}
```




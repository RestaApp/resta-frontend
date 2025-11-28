import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './utils/telegram'
import { store } from './store'

// Отключение темной темы
document.documentElement.classList.remove('dark')
localStorage.removeItem('theme')

// Инициализация Telegram Web App
initTelegramWebApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)

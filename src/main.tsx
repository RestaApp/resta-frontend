import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import './index.css'
import App from './App.tsx'
import { initTelegramWebApp } from './utils/telegram'
import { store, persistor } from './store'
import { AuthProvider } from './contexts/AuthContext'

// Отключение темной темы
document.documentElement.classList.remove('dark')
localStorage.removeItem('theme')

// Инициализация Telegram Web App
initTelegramWebApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)

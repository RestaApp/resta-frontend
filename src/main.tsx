import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import '@/shared/i18n/config'
import './index.css'
import { App } from './App'
import { store, persistor } from './store'
import { TelegramProvider } from './contexts/TelegramContext'
import { AuthProvider } from './contexts/AuthContext'
import { initTheme } from './utils/theme'

// Инициализация темы до рендера (localStorage / prefers-color-scheme)
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TelegramProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TelegramProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)

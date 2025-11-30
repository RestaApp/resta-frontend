/**
 * Redux Store конфигурация
 */

import { configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { api } from './api'
import userReducer from './userSlice'
import telegramReducer from './telegramSlice'

// Импортируем все API endpoints для их регистрации
// Это гарантирует, что все endpoints будут зарегистрированы в api
import '../services/api'

/**
 * Конфигурация persist для user slice
 * Использует sessionStorage вместо localStorage
 * Создаем правильный storage engine для redux-persist
 */
const createSessionStorage = () => {
  const isServer = typeof window === 'undefined'

  // Для серверной стороны возвращаем noop storage
  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null)
      },
      setItem() {
        return Promise.resolve()
      },
      removeItem() {
        return Promise.resolve()
      },
    }
  }

  // Для клиентской стороны используем sessionStorage
  return {
    getItem(key: string): Promise<string | null> {
      return Promise.resolve(window.sessionStorage.getItem(key))
    },
    setItem(key: string, value: string): Promise<void> {
      window.sessionStorage.setItem(key, value)
      return Promise.resolve()
    },
    removeItem(key: string): Promise<void> {
      window.sessionStorage.removeItem(key)
      return Promise.resolve()
    },
  }
}

const sessionStorage = createSessionStorage()

const userPersistConfig = {
  key: 'user',
  storage: sessionStorage,
  whitelist: ['userData', 'selectedRole'], // Сохраняем только userData и selectedRole
}

const persistedUserReducer = persistReducer(userPersistConfig, userReducer)

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: persistedUserReducer,
    telegram: telegramReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

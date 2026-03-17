/**
 * Redux Store конфигурация
 */

import { configureStore, type Middleware } from '@reduxjs/toolkit'
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
import userReducer, { clearUserData } from '@/features/navigation/model/userSlice'
import telegramReducer from '@/features/navigation/model/telegramSlice'
import catalogReducer from '@/features/navigation/model/catalogSlice'
import navigationReducer from '@/features/navigation/model/navigationSlice'
import { authSessionExpired } from '@/shared/api/authEvents'

// Импортируем все API endpoints для их регистрации
// Это гарантирует, что все endpoints будут зарегистрированы в api
import '@/services/api'

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

const authSessionMiddleware: Middleware = storeApi => next => action => {
  const result = next(action)

  if (authSessionExpired.match(action)) {
    storeApi.dispatch(clearUserData())
    storeApi.dispatch(api.util.resetApiState())
  }

  return result
}

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: persistedUserReducer,
    telegram: telegramReducer,
    catalog: catalogReducer,
    navigation: navigationReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware, authSessionMiddleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

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

import { api } from '@/shared/api/api'

// Регистрируем endpoints (side-effect import)
import '@/services/api'

// Импорты редюсеров
import userReducer from '@/features/navigation/model/userSlice'
import telegramReducer from '@/features/navigation/model/telegramSlice'
import catalogReducer from '@/features/navigation/model/catalogSlice'
import navigationReducer from '@/features/navigation/model/navigationSlice'

const createSessionStorage = () => {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    return {
      getItem: async () => null,
      setItem: async () => undefined,
      removeItem: async () => undefined,
    }
  }

  return {
    getItem: async (key: string) => window.sessionStorage.getItem(key),
    setItem: async (key: string, value: string) => {
      window.sessionStorage.setItem(key, value)
    },
    removeItem: async (key: string) => {
      window.sessionStorage.removeItem(key)
    },
  }
}

const sessionStorage = createSessionStorage()

const userPersistConfig = {
  key: 'user',
  storage: sessionStorage,
  whitelist: ['userData', 'selectedRole'],
}

const persistedUserReducer = persistReducer(userPersistConfig, userReducer)

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
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(api.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

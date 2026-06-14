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
import storage from 'redux-persist/lib/storage'
import { api } from './api'
import userReducer from '@/features/navigation/model/userSlice'
import telegramReducer from '@/features/navigation/model/telegramSlice'
import navigationReducer from '@/features/navigation/model/navigationSlice'
import { authSessionExpired } from '@/shared/api/authEvents'
import { clearUserData } from '@/shared/store/user'

// Импортируем все API endpoints для их регистрации
import '@/services/api'

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['userData', 'selectedRole'],
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

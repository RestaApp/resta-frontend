/**
 * Redux Store конфигурация
 */

import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'

// Импортируем все API endpoints для их регистрации
// Это гарантирует, что все endpoints будут зарегистрированы в api
import '../services/api'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

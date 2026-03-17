import { createAction } from '@reduxjs/toolkit'

/**
 * Сигнал, что refresh токена не прошел и пользователь должен быть разлогинен.
 * Обрабатывается на уровне store middleware.
 */
export const authSessionExpired = createAction('auth/sessionExpired')

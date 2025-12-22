/**
 * Redux slice для данных Telegram
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface TelegramState {
  initData: string | null
  isReady: boolean
}

const initialState: TelegramState = {
  initData: null,
  isReady: false,
}

const telegramSlice = createSlice({
  name: 'telegram',
  initialState,
  reducers: {
    setInitData: (state, action: PayloadAction<string | null>) => {
      state.initData = action.payload
    },
    setReady: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload
    },
  },
})

export const { setInitData, setReady } = telegramSlice.actions
export default telegramSlice.reducer

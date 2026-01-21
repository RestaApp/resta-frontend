import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'

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

const selectTelegramState = (state: RootState) => state.telegram

export const selectTelegramInitData = createSelector([selectTelegramState], (s) => s.initData)
export const selectTelegramIsReady = createSelector([selectTelegramState], (s) => s.isReady)
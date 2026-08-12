import { describe, expect, it, vi } from 'vitest'
import { APP_EVENTS, emitAppEvent, onAppEvent } from './appEvents'

describe('appEvents · профильная шапка', () => {
  it('передаёт состояние видимости и отписывает слушатель', () => {
    const handler = vi.fn()
    const unsubscribe = onAppEvent(APP_EVENTS.SET_PROFILE_HEADER_HIDDEN, handler)

    emitAppEvent(APP_EVENTS.SET_PROFILE_HEADER_HIDDEN, { hidden: true })
    expect(handler).toHaveBeenCalledWith({ hidden: true })

    unsubscribe()
    emitAppEvent(APP_EVENTS.SET_PROFILE_HEADER_HIDDEN, { hidden: false })
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

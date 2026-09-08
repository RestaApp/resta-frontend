import { describe, expect, it } from 'vitest'
import reducer, { navigateToTab, consumeCommand, setStaffApplicationsOpen } from './navigationSlice'

describe('staff applications destination', () => {
  it('retains the drawer destination after the tab navigation command is consumed', () => {
    let state = reducer(undefined, setStaffApplicationsOpen(true))
    state = reducer(state, navigateToTab('staff'))
    expect(state.command).toEqual({ type: 'NAVIGATE_TAB', tab: 'staff' })
    state = reducer(state, consumeCommand())
    expect(state.isStaffApplicationsOpen).toBe(true)
    state = reducer(state, setStaffApplicationsOpen(false))
    expect(state.isStaffApplicationsOpen).toBe(false)
  })
})

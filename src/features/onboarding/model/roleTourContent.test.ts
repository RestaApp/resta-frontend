import { describe, expect, it } from 'vitest'
import { getRoleTourSteps } from './roleTourContent'

describe('getRoleTourSteps', () => {
  it('employee → 4 шага по вкладкам в порядке навигации', () => {
    const steps = getRoleTourSteps('chef')
    expect(steps.map(s => s.tabId)).toEqual(['feed', 'activity', 'myshifts', 'profile'])
  })

  it('venue → 4 шага', () => {
    const steps = getRoleTourSteps('venue')
    expect(steps.map(s => s.tabId)).toEqual(['activity', 'staff', 'suppliers', 'profile'])
  })

  it('supplier → 2 шага', () => {
    const steps = getRoleTourSteps('supplier')
    expect(steps.map(s => s.tabId)).toEqual(['home', 'profile'])
  })

  it('у каждого шага есть иконка, заголовок и текст', () => {
    for (const role of ['chef', 'venue', 'supplier'] as const) {
      for (const step of getRoleTourSteps(role)) {
        expect(step.icon).toBeTruthy()
        expect(step.titleKey).toMatch(/^tabs\./)
        expect(step.textKey).toMatch(/^onboarding\.tour\./)
      }
    }
  })
})

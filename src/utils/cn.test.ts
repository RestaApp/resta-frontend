import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('склеивает классы и разрешает конфликты tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('поддерживает условные классы clsx', () => {
    const showBlock = true
    const showHidden = false
    expect(cn('base', showHidden && 'hidden', showBlock && 'block')).toBe('base block')
  })
})

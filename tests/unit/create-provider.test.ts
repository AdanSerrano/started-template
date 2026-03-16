import { describe, it, expect } from 'vitest'
import { createProvider } from '@/lib/create-provider'

describe('createProvider', () => {
  it('should lazily create instance on first get()', () => {
    let callCount = 0
    const provider = createProvider(() => {
      callCount++
      return { value: 42 }
    })

    expect(callCount).toBe(0)
    const instance = provider.get()
    expect(callCount).toBe(1)
    expect(instance.value).toBe(42)
  })

  it('should return same instance on subsequent get() calls', () => {
    const provider = createProvider(() => ({ value: Math.random() }))

    const first = provider.get()
    const second = provider.get()

    expect(first).toBe(second)
  })

  it('should allow overriding instance with set()', () => {
    const provider = createProvider(() => ({ value: 'original' }))

    provider.set({ value: 'overridden' })

    expect(provider.get().value).toBe('overridden')
  })

  it('should create new instance after reset()', () => {
    let callCount = 0
    const provider = createProvider(() => {
      callCount++
      return { call: callCount }
    })

    const first = provider.get()
    expect(first.call).toBe(1)

    provider.reset()
    const second = provider.get()
    expect(second.call).toBe(2)
    expect(first).not.toBe(second)
  })
})

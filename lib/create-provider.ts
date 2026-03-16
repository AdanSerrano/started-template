/**
 * Helper generico para crear providers singleton con lazy initialization.
 * Reduce el boilerplate en providers.ts.
 */
export function createProvider<T>(factory: () => T) {
  let instance: T | null = null
  return {
    get(): T {
      if (!instance) instance = factory()
      return instance
    },
    set(impl: T): void {
      instance = impl
    },
    reset(): void {
      instance = null
    },
  }
}

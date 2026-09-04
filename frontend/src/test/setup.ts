// Minimal localStorage shim so repository/service tests can run under Node.
// This mirrors the browser Web Storage API used by practiceRepository.ts.
function createStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear(): void {
      store.clear()
    },
    getItem(key: string): string | null {
      return store.has(key) ? (store.get(key) as string) : null
    },
    key(index: number): string | null {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string): void {
      store.delete(key)
    },
    setItem(key: string, value: string): void {
      store.set(key, String(value))
    },
  }
}

if (!globalThis.window) {
  ;(globalThis as Record<string, unknown>).window = globalThis
  ;(globalThis as Record<string, unknown>).localStorage = createStorage()
  ;(globalThis.window as Record<string, unknown>).localStorage = createStorage()
}

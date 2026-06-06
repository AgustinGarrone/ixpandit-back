interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LruTtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value);

    return value;
  }

  set(key: string, value: T): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value as string;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  get size(): number {
    return this.store.size;
  }
}

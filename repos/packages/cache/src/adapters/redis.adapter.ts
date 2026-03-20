import type { CachePort } from '@ports'

/** Minimal Redis-like client (e.g. ioredis) for adapter use. */
export interface RedisLike {
  get(key: string): Promise<string | null>
  set(
    key: string,
    value: string,
    ...args: (string | number)[]
  ): Promise<'OK' | undefined>
  del(key: string): Promise<number>
}

export class RedisCacheAdapter implements CachePort {
  constructor(private readonly redis: RedisLike) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? (JSON.parse(data) as T) : null
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }
}

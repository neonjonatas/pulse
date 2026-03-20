/**
 * Cache contract for infrastructure adapters.
 *
 * @example
 * class UserCache extends CachePort {}
 */
export abstract class CachePort {
  abstract get<Value>(key: string): Promise<Value | null>

  abstract set<Value>(
    key: string,
    value: Value,
    ttlSeconds: number
  ): Promise<void>

  abstract delete?(key: string): Promise<void>
}

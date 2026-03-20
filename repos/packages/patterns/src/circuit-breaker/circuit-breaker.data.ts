import { CircuitBreakerConfig } from './circuit-breaker.types'

export const DEFAULT_OPTIONS: CircuitBreakerConfig = {
  failureThreshold: 3,
  timeoutMs: 10_000,
  resetTimeoutMs: 60_000,
  successThreshold: 1
}

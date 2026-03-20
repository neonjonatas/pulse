import { CircuitBreakerState } from './circuit-breaker-state.enum'

export type CircuitBreakerStateChangeCallback = (params: {
  previous: CircuitBreakerState
  next: CircuitBreakerState
}) => void

export type CircuitBreakerFailureCallback = (error: unknown) => void
export type CircuitBreakerSuccessCallback = () => void

export interface CircuitBreakerOptions {
  failureThreshold: number
  timeoutMs?: number
  resetTimeoutMs?: number
  successThreshold?: number
  onStateChange?: CircuitBreakerStateChangeCallback
  onFailure?: CircuitBreakerFailureCallback
  onSuccess?: CircuitBreakerSuccessCallback
}

export interface CircuitBreakerConfig extends CircuitBreakerOptions {
  timeoutMs: number
  resetTimeoutMs: number
  successThreshold: number
}

export interface CircuitBreakerStats {
  failures: number
  successes: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  lastFailureTime: number | null
}

export type Operation<Result> = () => Promise<Result>

export type CircuitBreakerFallback<Result> = () => Promise<Result>

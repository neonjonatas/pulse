import { CircuitBreakerState } from './circuit-breaker-state.enum'
import {
  CircuitBreakerConfig,
  CircuitBreakerFallback,
  CircuitBreakerStats,
  Operation,
  CircuitBreakerOptions
} from './circuit-breaker.types'
import { validateCircuitBreakerOptions } from './constructor-options.guard'
import { DEFAULT_OPTIONS } from './circuit-breaker.data'
import { CircuitBreakerTimeoutError } from './circuit-breaker-timeout.error'
import { CircuitBreakerOpenError } from './circuit-breaker-open.error'

export class CircuitBreaker {
  private state = CircuitBreakerState.Closed
  private nextAttempt = 0
  private halfOpenInFlight = false
  private stats: CircuitBreakerStats = {
    failures: 0,
    successes: 0,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    lastFailureTime: null
  }
  private readonly config: CircuitBreakerConfig

  constructor(options: CircuitBreakerOptions) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_OPTIONS.timeoutMs
    const resetTimeoutMs =
      options.resetTimeoutMs ?? DEFAULT_OPTIONS.resetTimeoutMs
    const successThreshold =
      options.successThreshold ?? DEFAULT_OPTIONS.successThreshold

    validateCircuitBreakerOptions({
      failureThreshold: options.failureThreshold,
      timeoutMs,
      resetTimeoutMs,
      successThreshold
    })

    this.config = Object.freeze({
      ...DEFAULT_OPTIONS,
      ...options,
      timeoutMs,
      resetTimeoutMs,
      successThreshold
    })
  }

  async execute<Result>(
    operation: Operation<Result>,
    failureFallback?: CircuitBreakerFallback<Result>
  ): Promise<Result> {
    const openStateResult = await this.handleOpenState<Result>(failureFallback)
    if (openStateResult !== undefined) {
      return openStateResult
    }

    try {
      const result = await this.executeWithTimeout(operation)
      this.onSuccess()
      this.config.onSuccess?.()
      return result
    } catch (error) {
      this.onFailure(error)
      this.config.onFailure?.(error)

      if (failureFallback) {
        return await failureFallback()
      }

      throw error
    }
  }

  private async handleOpenState<Result>(
    failureFallback?: CircuitBreakerFallback<Result>
  ): Promise<Result | undefined> {
    if (this.state !== CircuitBreakerState.Open) {
      return undefined
    }

    if (Date.now() >= this.nextAttempt) {
      if (this.halfOpenInFlight) {
        if (failureFallback) {
          return await failureFallback()
        }
        throw new CircuitBreakerOpenError()
      }

      this.halfOpenInFlight = true
      this.transitionTo(CircuitBreakerState.HalfOpen)
      return undefined
    }

    if (failureFallback) {
      return await failureFallback()
    }
    throw new CircuitBreakerOpenError()
  }

  private async executeWithTimeout<Result>(
    operation: Operation<Result>
  ): Promise<Result> {
    const operationPromise = operation()
    const timeoutPromise = new Promise<Result>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new CircuitBreakerTimeoutError(this.config.timeoutMs))
      }, this.config.timeoutMs)

      void operationPromise.finally(() => clearTimeout(timeoutId))
    })

    return Promise.race([operationPromise, timeoutPromise])
  }

  private onSuccess(): void {
    this.stats.successes += 1
    this.stats.consecutiveSuccesses += 1
    this.stats.consecutiveFailures = 0

    if (this.state === CircuitBreakerState.HalfOpen) {
      if (this.stats.consecutiveSuccesses >= this.config.successThreshold) {
        this.halfOpenInFlight = false
        this.resetStats()
        this.transitionTo(CircuitBreakerState.Closed)
      }
    }
  }

  private onFailure(_error: unknown): void {
    this.stats.failures += 1
    this.stats.consecutiveFailures += 1
    this.stats.consecutiveSuccesses = 0
    this.stats.lastFailureTime = Date.now()

    if (this.state === CircuitBreakerState.HalfOpen) {
      this.halfOpenInFlight = false
      this.trip()
      return
    }

    if (this.stats.consecutiveFailures >= this.config.failureThreshold) {
      this.trip()
    }
  }

  private trip(): void {
    this.nextAttempt = Date.now() + this.config.resetTimeoutMs
    this.transitionTo(CircuitBreakerState.Open)
  }

  private transitionTo(nextState: CircuitBreakerState): void {
    if (this.state === nextState) return

    const previousState = this.state
    this.state = nextState
    this.config.onStateChange?.({ previous: previousState, next: nextState })
  }

  private resetStats(): void {
    this.stats = {
      failures: 0,
      successes: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastFailureTime: null
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  getStats(): CircuitBreakerStats {
    return { ...this.stats }
  }

  reset(): void {
    this.halfOpenInFlight = false
    this.nextAttempt = 0
    this.resetStats()
    this.transitionTo(CircuitBreakerState.Closed)
  }
}

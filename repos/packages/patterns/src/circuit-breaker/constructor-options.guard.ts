import { CircuitBreakerConfig } from './circuit-breaker.types'

export enum GuardErrorMessage {
  FailureThreshold = 'Circuit breaker failureThreshold must be >= 1',
  SuccessThreshold = 'Circuit breaker successThreshold must be >= 1',
  TimeoutMs = 'Circuit breaker timeoutMs must be >= 1',
  ResetTimeoutMs = 'Circuit breaker resetTimeoutMs must be >= 1'
}

export type CircuitBreakerValidationOptions = Pick<
  CircuitBreakerConfig,
  'failureThreshold' | 'timeoutMs' | 'resetTimeoutMs' | 'successThreshold'
>

function validatePositiveInteger(value: number, error: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(error)
  }
}

export function validateCircuitBreakerOptions(
  options: CircuitBreakerValidationOptions
): void {
  validatePositiveInteger(
    options.failureThreshold,
    GuardErrorMessage.FailureThreshold
  )
  validatePositiveInteger(
    options.successThreshold,
    GuardErrorMessage.SuccessThreshold
  )
  validatePositiveInteger(options.timeoutMs, GuardErrorMessage.TimeoutMs)
  validatePositiveInteger(
    options.resetTimeoutMs,
    GuardErrorMessage.ResetTimeoutMs
  )
}

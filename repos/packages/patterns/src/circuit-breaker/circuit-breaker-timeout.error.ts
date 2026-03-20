export class CircuitBreakerTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`)
    this.name = 'CircuitBreakerTimeoutError'
    Object.setPrototypeOf(this, CircuitBreakerTimeoutError.prototype)
  }
}

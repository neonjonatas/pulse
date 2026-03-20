export class CircuitBreakerOpenError extends Error {
  constructor() {
    super('Circuit breaker is open')
    this.name = 'CircuitBreakerOpenError'
    Object.setPrototypeOf(this, CircuitBreakerOpenError.prototype)
  }
}

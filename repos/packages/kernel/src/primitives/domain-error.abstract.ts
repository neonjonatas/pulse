/**
 * Domain-specific error with a machine-readable code.
 *
 * @param code - Machine-readable error code (e.g. ORDER_NOT_FOUND)
 * @param message - Human-readable error message
 * @example
 * throw new DomainError('ORDER_NOT_FOUND', 'Order with id xyz was not found')
 */
export class DomainError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'DomainError'
  }
}

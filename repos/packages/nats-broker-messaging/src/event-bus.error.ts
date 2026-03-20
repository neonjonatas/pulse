import { DomainError } from '@pack/kernel'

/**
 * Base error type for the messaging package.
 */
export class EventBusError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message)
    this.name = 'EventBusError'
  }
}

/**
 * Raised when broker connection establishment fails.
 */
export class EventBusConnectionError extends EventBusError {
  constructor(message: string) {
    super('EVENT_BUS_CONNECTION_ERROR', message)
    this.name = 'EventBusConnectionError'
  }
}

/**
 * Raised when publish operation fails.
 */
export class EventBusPublishError extends EventBusError {
  constructor(subject: string, cause?: string) {
    super(
      'EVENT_BUS_PUBLISH_ERROR',
      `Failed to publish to "${subject}"${cause ? `: ${cause}` : ''}`
    )
    this.name = 'EventBusPublishError'
  }
}

/**
 * Raised when subscription setup fails.
 */
export class EventBusSubscriptionError extends EventBusError {
  constructor(subject: string, cause?: string) {
    super(
      'EVENT_BUS_SUBSCRIPTION_ERROR',
      `Failed to subscribe to "${subject}"${cause ? `: ${cause}` : ''}`
    )
    this.name = 'EventBusSubscriptionError'
  }
}

/**
 * Raised when an incoming envelope fails schema validation.
 */
export class EventBusValidationError extends EventBusError {
  readonly field: string
  readonly reason: string

  constructor(subject: string, field: string, reason: string) {
    super(
      'EVENT_BUS_VALIDATION_ERROR',
      `Invalid envelope on "${subject}": ${field} - ${reason}`
    )
    this.name = 'EventBusValidationError'
    this.field = field
    this.reason = reason
  }
}

/**
 * Raised when envelope version differs from expected consumer version.
 */
export class EventBusVersionMismatchError extends EventBusError {
  readonly expected: number
  readonly received: number

  constructor(subject: string, expected: number, received: number) {
    super(
      'EVENT_BUS_VERSION_MISMATCH',
      `Event "${subject}" version mismatch: expected ${expected}, received ${received}`
    )
    this.name = 'EventBusVersionMismatchError'
    this.expected = expected
    this.received = received
  }
}

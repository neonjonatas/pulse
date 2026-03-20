/**
 * Metadata key used to mark declarative event consumers.
 */
export const EVENT_CONSUMER_METADATA = Symbol('EVENT_CONSUMER_METADATA')

/**
 * Configuration options for declarative event consumer handlers.
 */
export interface EventConsumerOptions {
  subject: string
  queue: string
  expectedVersion?: number
}

/**
 * Decorates a method as a NATS message handler for a specific subject.
 */
export function EventConsumer(
  subject: string,
  options: { queue: string; expectedVersion?: number }
): MethodDecorator {
  return (target, propertyKey) => {
    const methodRef = (target as Record<string | symbol, unknown>)[
      propertyKey
    ] as object
    Reflect.defineMetadata(
      EVENT_CONSUMER_METADATA,
      {
        subject,
        queue: options.queue,
        expectedVersion: options.expectedVersion,
        handlerMethod: propertyKey
      },
      methodRef
    )
  }
}

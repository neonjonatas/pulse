import type { EventPrimitive } from '@pack/kernel'

/**
 * Transport context for publish middleware.
 */
export interface PublishContext<Payload = Record<string, unknown>> {
  subject: string
  envelope: EventPrimitive<Payload>
  timestamp: number
}

/**
 * Transport context for consume middleware.
 */
export interface ConsumeContext<Payload = Record<string, unknown>> {
  subject: string
  envelope: EventPrimitive<Payload>
  timestamp: number
}

/**
 * Middleware contract executed around publish operations.
 */
export type PublishMiddleware<Payload = Record<string, unknown>> = (
  context: PublishContext<Payload>,
  next: () => Promise<void>
) => Promise<void>

/**
 * Middleware contract executed around consume operations.
 */
export type ConsumeMiddleware<Payload = Record<string, unknown>> = (
  context: ConsumeContext<Payload>,
  next: () => Promise<void>
) => Promise<void>

/**
 * Consumer handler signature receiving a full event envelope.
 */
export type MessageHandler<Payload = Record<string, unknown>> = (
  envelope: EventPrimitive<Payload>
) => void | Promise<void>

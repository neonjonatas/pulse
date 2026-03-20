import type { EventPrimitive } from '@pack/kernel'

import type { EventContract } from '@messaging-types'

/**
 * Transport-level event bus contract used by services to publish and consume
 * NATS messages.
 *
 * This is intentionally separate from kernel's domain `EventBus`, which is
 * in-process and domain-event oriented.
 */
export abstract class EventBus<Events extends EventContract = EventContract> {
  /**
   * Publishes an envelope to a subject.
   */
  abstract emit<EventName extends keyof Events & string>(
    event: EventName,
    payload: EventPrimitive<Events[EventName]>
  ): Promise<void>

  /**
   * Registers a handler for the subject and returns an unsubscribe function.
   */
  abstract on<EventName extends keyof Events & string>(
    event: EventName,
    handler: (
      payload: EventPrimitive<Events[EventName]>
    ) => void | Promise<void>
  ): () => void
}

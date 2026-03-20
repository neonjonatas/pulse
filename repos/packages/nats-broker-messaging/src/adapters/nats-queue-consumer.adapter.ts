import type { EventPrimitive } from '@pack/kernel'
import type { NatsConnection } from 'nats'

import { NatsConsumer } from '@nats'
import type { EventContract } from '@messaging-types'

/**
 * Queue-group consumer adapter with payload-first handler compatibility.
 *
 * This wrapper maintains previous callback signatures while internally using
 * `NatsConsumer` with validated `EventPrimitive` envelopes.
 */
export class NatsQueueConsumerAdapter<Events extends EventContract> {
  private readonly consumer: NatsConsumer<Events>

  constructor(connection: NatsConnection, queue: string) {
    this.consumer = new NatsConsumer<Events>(connection, queue)
  }

  /**
   * Subscribes to subject and passes only envelope payload to handler.
   */
  subscribe<EventName extends keyof Events & string>(
    event: EventName,
    handler: (payload: Events[EventName]) => void | Promise<void>
  ): () => void {
    return this.consumer.subscribe(event, async (envelope) => {
      await handler(envelope.payload as Events[EventName])
    })
  }

  /**
   * Envelope-aware variant for callers that need metadata.
   */
  subscribeEnvelope<EventName extends keyof Events & string>(
    event: EventName,
    handler: (
      envelope: EventPrimitive<Events[EventName]>
    ) => void | Promise<void>
  ): () => void {
    return this.consumer.subscribe(event, handler)
  }

  /**
   * Cancels all active queue subscriptions.
   */
  unsubscribeAll(): void {
    this.consumer.unsubscribeAll()
  }
}

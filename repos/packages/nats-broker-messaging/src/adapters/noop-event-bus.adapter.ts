import type { EventPrimitive } from '@pack/kernel'

import { NoopConsumer } from './noop-consumer.adapter'
import { NoopPublisher } from './noop-publisher.adapter'
import { EventBus } from '@ports'
import type { EventContract } from '@messaging-types'

/**
 * Backward-compatible no-op event bus that preserves legacy API shape.
 */
export class NoopEventBusAdapter<
  Events extends EventContract
> extends EventBus<Events> {
  private readonly publisher = new NoopPublisher<Events>()
  private readonly consumer = new NoopConsumer<Events>()

  /**
   * No-op emit in local mode.
   */
  async emit<EventName extends keyof Events & string>(
    event: EventName,
    payload: EventPrimitive<Events[EventName]>
  ): Promise<void> {
    await this.publisher.publish(event, payload)
  }

  /**
   * No-op subscribe in local mode.
   */
  on<EventName extends keyof Events & string>(
    event: EventName,
    handler: (
      payload: EventPrimitive<Events[EventName]>
    ) => void | Promise<void>
  ): () => void {
    return this.consumer.on(event, handler)
  }
}

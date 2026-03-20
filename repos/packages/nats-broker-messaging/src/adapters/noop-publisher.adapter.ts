import type { EventPrimitive } from '@pack/kernel'

import type { EventContract } from '@messaging-types'

/**
 * No-op publisher used when NATS is disabled.
 */
export class NoopPublisher<Events extends EventContract> {
  /**
   * Ignores publish requests in local/no-op mode.
   */
  async publish<EventName extends keyof Events & string>(
    _subject: EventName,
    _envelope: EventPrimitive<Events[EventName]>
  ): Promise<void> {}
}

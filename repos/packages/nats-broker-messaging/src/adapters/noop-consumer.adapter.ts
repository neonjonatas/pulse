import type { EventPrimitive } from '@pack/kernel'

import type { MessageHandler } from '@middleware'
import type { EventContract } from '@messaging-types'

/**
 * No-op consumer used when NATS is disabled.
 */
export class NoopConsumer<Events extends EventContract> {
  /**
   * Returns a noop unsubscriber without registering any handler.
   */
  subscribe<EventName extends keyof Events & string>(
    _subject: EventName,
    _handler: MessageHandler<Events[EventName]>
  ): () => void {
    return () => undefined
  }

  /**
   * Wildcard variant for API parity with `NatsConsumer`.
   */
  subscribeWildcard(
    _subjectPattern: string,
    _handler: (
      subject: string,
      envelope: EventPrimitive<Record<string, unknown>>
    ) => void | Promise<void>
  ): () => void {
    return () => undefined
  }

  /**
   * Legacy alias matching prior API.
   */
  on<EventName extends keyof Events & string>(
    subject: EventName,
    handler: MessageHandler<Events[EventName]>
  ): () => void {
    return this.subscribe(subject, handler)
  }

  /**
   * No-op cleanup for local mode.
   */
  unsubscribeAll(): void {}
}

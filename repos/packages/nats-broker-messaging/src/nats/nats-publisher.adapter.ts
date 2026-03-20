import type { EventPrimitive } from '@pack/kernel'
import { type NatsConnection, StringCodec } from 'nats'

import type { ConsumeMiddleware, PublishMiddleware } from '@middleware'
import { EventBusPublishError } from '@errors'
import type { EventContract } from '@messaging-types'

/**
 * Publishes event envelopes to NATS subjects.
 */
export class NatsPublisher<Events extends EventContract> {
  private readonly sc = StringCodec()
  private readonly publishMiddleware: PublishMiddleware[]

  constructor(
    private readonly nc: NatsConnection,
    options?: {
      publishMiddleware?: PublishMiddleware[]
      consumeMiddleware?: ConsumeMiddleware[]
    }
  ) {
    this.publishMiddleware = options?.publishMiddleware ?? []
  }

  /**
   * Publishes an event envelope to the provided subject.
   */
  async publish<EventName extends keyof Events & string>(
    subject: EventName,
    envelope: EventPrimitive<Events[EventName]>
  ): Promise<void> {
    const dispatch = async (): Promise<void> => {
      try {
        const data = this.sc.encode(JSON.stringify(envelope))
        this.nc.publish(subject, data)
      } catch (error) {
        throw new EventBusPublishError(subject, String(error))
      }
    }

    if (!this.publishMiddleware.length) {
      await dispatch()
      return
    }

    let index = 0
    const next = async (): Promise<void> => {
      const middleware = this.publishMiddleware[index++]
      if (!middleware) {
        await dispatch()
        return
      }
      await middleware(
        {
          subject,
          envelope: envelope as EventPrimitive,
          timestamp: Date.now()
        },
        next
      )
    }
    await next()
  }

  /**
   * Backward-compatible alias for legacy emit/on contract.
   */
  async emit<EventName extends keyof Events & string>(
    subject: EventName,
    envelope: EventPrimitive<Events[EventName]>
  ): Promise<void> {
    await this.publish(subject, envelope)
  }
}

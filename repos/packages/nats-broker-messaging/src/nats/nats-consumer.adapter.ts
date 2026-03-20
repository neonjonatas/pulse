import type { EventPrimitive } from '@pack/kernel'
import { type NatsConnection, StringCodec } from 'nats'

import {
  EventBusSubscriptionError,
  EventBusValidationError,
  EventBusVersionMismatchError
} from '@errors'
import type {
  ConsumeMiddleware,
  MessageHandler,
  PublishMiddleware
} from '@middleware'
import type { EventContract } from '@messaging-types'
import { eventPrimitiveEnvelopeSchema } from '@validation'

/**
 * Consumes NATS subjects with queue-group semantics and envelope validation.
 */
export class NatsConsumer<Events extends EventContract> {
  private readonly sc = StringCodec()
  private readonly unsubscribers: Array<() => void> = []
  private readonly consumeMiddleware: ConsumeMiddleware[]

  constructor(
    private readonly nc: NatsConnection,
    private readonly queue: string,
    options?: {
      publishMiddleware?: PublishMiddleware[]
      consumeMiddleware?: ConsumeMiddleware[]
    }
  ) {
    this.consumeMiddleware = options?.consumeMiddleware ?? []
  }

  /**
   * Subscribes to a subject and invokes handler with validated envelopes.
   */
  subscribe<EventName extends keyof Events & string>(
    subject: EventName,
    handler: MessageHandler<Events[EventName]>,
    options?: { expectedVersion?: number }
  ): () => void {
    let sub
    try {
      sub = this.nc.subscribe(subject, { queue: this.queue })
    } catch (error) {
      throw new EventBusSubscriptionError(subject, String(error))
    }

    void (async () => {
      for await (const msg of sub) {
        try {
          const raw = JSON.parse(this.sc.decode(msg.data))
          const parsed = eventPrimitiveEnvelopeSchema.safeParse(raw)
          if (!parsed.success) {
            const issue = parsed.error.issues[0]
            throw new EventBusValidationError(
              subject,
              issue?.path.join('.') || 'unknown',
              issue?.message || 'invalid payload'
            )
          }

          const envelope = parsed.data as EventPrimitive<Events[EventName]>
          if (
            typeof options?.expectedVersion === 'number' &&
            envelope.eventVersion !== options.expectedVersion
          ) {
            throw new EventBusVersionMismatchError(
              subject,
              options.expectedVersion,
              envelope.eventVersion
            )
          }

          const runHandler = async (): Promise<void> => {
            await handler(envelope)
          }

          if (!this.consumeMiddleware.length) {
            await runHandler()
            continue
          }

          let index = 0
          const next = async (): Promise<void> => {
            const middleware = this.consumeMiddleware[index++]
            if (!middleware) {
              await runHandler()
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
        } catch {
          // Per-message failures should not stop the subscription loop.
        }
      }
    })()

    const unsubscribe = () => sub.unsubscribe()
    this.unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  /**
   * Subscribes to a wildcard subject and receives the matched subject name.
   */
  subscribeWildcard(
    subjectPattern: string,
    handler: (
      subject: string,
      envelope: EventPrimitive<Record<string, unknown>>
    ) => void | Promise<void>
  ): () => void {
    const sub = this.nc.subscribe(subjectPattern, { queue: this.queue })

    void (async () => {
      for await (const msg of sub) {
        try {
          const raw = JSON.parse(this.sc.decode(msg.data))
          const parsed = eventPrimitiveEnvelopeSchema.safeParse(raw)
          if (!parsed.success) continue
          await handler(msg.subject, parsed.data)
        } catch {
          // Per-message failures should not stop the subscription loop.
        }
      }
    })()

    const unsubscribe = () => sub.unsubscribe()
    this.unsubscribers.push(unsubscribe)
    return unsubscribe
  }

  /**
   * Backward-compatible alias matching previous API naming.
   */
  on<EventName extends keyof Events & string>(
    subject: EventName,
    handler: MessageHandler<Events[EventName]>
  ): () => void {
    return this.subscribe(subject, handler)
  }

  /**
   * Cancels all active subscriptions created by this consumer.
   */
  unsubscribeAll(): void {
    for (const unsubscribe of this.unsubscribers) unsubscribe()
    this.unsubscribers.length = 0
  }
}

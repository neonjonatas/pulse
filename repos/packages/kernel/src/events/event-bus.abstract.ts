import type { ObjectPrimitive } from '@types'
import { DomainEvent } from '@primitives'

import { EventHandler } from './event-handler.abstract'

/**
 * In-process event bus that routes domain events to subscribed handlers.
 * Dispatch is keyed on the string `eventName` returned by each `DomainEvent`.
 */
export abstract class EventBus<
  Domain,
  Props extends ObjectPrimitive<Domain>,
  Event extends DomainEvent<Domain, Props>
> {
  private readonly handlers: Map<string, EventHandler<Domain, Props, Event>[]> =
    new Map()

  subscribe(
    eventName: string,
    handler: EventHandler<Domain, Props, Event>
  ): void {
    const existing = this.handlers.get(eventName) ?? []
    existing.push(handler)
    this.handlers.set(eventName, existing)
  }

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? []
    await Promise.all(handlers.map((h) => h.handle(event)))
  }
}

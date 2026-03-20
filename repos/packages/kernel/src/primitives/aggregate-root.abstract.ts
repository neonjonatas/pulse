import type { EventPrimitive, ObjectPrimitive } from '@types'

import { DomainEntity } from './domain-entity.abstract'
import { DomainEvent } from './domain-event.abstract'
import { Id } from './id.abstract'

/**
 * Base class for aggregate roots.
 * Records rich `DomainEvent` instances internally and serializes them
 * to `EventPrimitive` on `pullEvents()` — callers receive transport-ready
 * envelopes without knowing the internal event class.
 */
export abstract class AggregateRoot<Props> extends DomainEntity<Props> {
  private readonly pendingEvents: DomainEvent<unknown, ObjectPrimitive>[] = []

  protected constructor(props: Props, id: Id) {
    super(props, id)
  }

  protected record(event: DomainEvent<unknown, ObjectPrimitive>): void {
    this.pendingEvents.push(event)
  }

  pullEvents(): EventPrimitive[] {
    const events = this.pendingEvents.map((e) => e.toPrimitive())
    this.pendingEvents.length = 0
    return events
  }
}

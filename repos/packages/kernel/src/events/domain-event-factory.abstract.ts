import type { ObjectPrimitive, EventPrimitive } from '@types'
import { DomainEvent } from '@primitives'

/**
 * Reconstructs a rich `DomainEvent` from a serialized `EventPrimitive`.
 * Implement one factory per event type to reconstitute domain events from
 * storage, message queues, or any transport layer.
 */
export abstract class DomainEventFactory<
  Domain,
  Props extends ObjectPrimitive<Domain>
> {
  abstract reconstitute(
    primitive: EventPrimitive<Props>
  ): DomainEvent<Domain, Props>
}

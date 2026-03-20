import type { ObjectPrimitive } from '@types'
import { DomainEvent } from '@primitives'

/**
 * Base class for domain event handlers.
 * `eventName` identifies which event this handler processes.
 */
export abstract class EventHandler<
  Domain,
  Props extends ObjectPrimitive<Domain>,
  Event extends DomainEvent<Domain, Props>
> {
  abstract readonly eventName: string
  abstract handle(event: Event): Promise<void>
}

import { DomainEvent } from '@pack/kernel'

import { UserEvent } from '@pack/event-inventory'

export interface UserProfileUpdatedPayload extends Record<string, unknown> {
  profileId: string
  fields: string[]
}

export class UserProfileUpdatedEvent extends DomainEvent<
  'SlimShady',
  UserProfileUpdatedPayload
> {
  constructor(
    aggregateId: string,
    props: UserProfileUpdatedPayload,
    meta: { eventId: string; occurredOn: Date }
  ) {
    super(aggregateId, props, meta)
  }

  get eventName(): string {
    return UserEvent.ProfileUpdated
  }

  get eventVersion(): number {
    return 1
  }
}

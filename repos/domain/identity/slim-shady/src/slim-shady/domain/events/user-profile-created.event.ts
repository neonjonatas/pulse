import { DomainEvent } from '@pack/kernel'

import { UserEvent } from '@pack/event-inventory'

export interface UserProfileCreatedPayload extends Record<string, unknown> {
  profileId: string
  authId: string
  email: string
}

export class UserProfileCreatedEvent extends DomainEvent<
  'SlimShady',
  UserProfileCreatedPayload
> {
  constructor(
    aggregateId: string,
    props: UserProfileCreatedPayload,
    meta: { eventId: string; occurredOn: Date }
  ) {
    super(aggregateId, props, meta)
  }

  get eventName(): string {
    return UserEvent.ProfileCreated
  }

  get eventVersion(): number {
    return 1
  }
}

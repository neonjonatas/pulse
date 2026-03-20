import { DomainEvent } from '@pack/kernel'

import { UserEvent } from '@pack/event-inventory'

export interface UserProfileDeletedPayload extends Record<string, unknown> {
  profileId: string
  authId: string
}

export class UserProfileDeletedEvent extends DomainEvent<
  'SlimShady',
  UserProfileDeletedPayload
> {
  constructor(
    aggregateId: string,
    props: UserProfileDeletedPayload,
    meta: { eventId: string; occurredOn: Date }
  ) {
    super(aggregateId, props, meta)
  }

  get eventName(): string {
    return UserEvent.ProfileDeleted
  }

  get eventVersion(): number {
    return 1
  }
}

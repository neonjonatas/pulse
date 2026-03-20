import { DomainEvent } from '@pack/kernel'

import { AuthorityEvent } from '@pack/event-inventory'

export interface UserLoggedOutPayload extends Record<string, unknown> {
  userId: string
  sessionId: string
}

export class UserLoggedOutEvent extends DomainEvent<
  'Authority',
  UserLoggedOutPayload
> {
  constructor(
    aggregateId: string,
    props: UserLoggedOutPayload,
    meta: { eventId: string; occurredOn: Date }
  ) {
    super(aggregateId, props, meta)
  }

  get eventName() {
    return AuthorityEvent.UserLoggedOut
  }

  get eventVersion() {
    return 1
  }
}

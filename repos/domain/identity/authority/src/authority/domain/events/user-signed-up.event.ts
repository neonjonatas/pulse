import { DomainEvent } from '@pack/kernel'
import type { AuthorityProvider } from '@domain/value-objects'

import { AuthorityEvent } from '@pack/event-inventory'

export interface UserSignedUpPayload extends Record<string, unknown> {
  userId: string
  email: string
  provider: AuthorityProvider
  name?: string | null
}

export class UserSignedUpEvent extends DomainEvent<
  'Authority',
  UserSignedUpPayload
> {
  constructor(
    aggregateId: string,
    props: UserSignedUpPayload,
    meta: { eventId: string; occurredOn: Date }
  ) {
    super(aggregateId, props, meta)
  }

  get eventName() {
    return AuthorityEvent.UserSignedUp
  }

  get eventVersion() {
    return 1
  }
}

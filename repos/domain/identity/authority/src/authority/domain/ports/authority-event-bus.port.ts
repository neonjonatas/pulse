import { EventBus } from '@pack/nats-broker-messaging'

import type { AuthorityEventMap } from '@domain/events'

export abstract class AuthorityEventBusPort extends EventBus<AuthorityEventMap> {}

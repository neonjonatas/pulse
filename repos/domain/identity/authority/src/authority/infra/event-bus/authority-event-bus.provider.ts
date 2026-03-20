import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import {
  NatsEventBusAdapter,
  NoopEventBusAdapter,
  NatsConnectionToken
} from '@pack/nats-broker-messaging'

import { AuthorityEventBusPort } from '@domain/ports'
import type { AuthorityEventMap } from '@domain/events'

export const authorityEventBusProvider: Provider = {
  provide: AuthorityEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) {
      return new NoopEventBusAdapter<AuthorityEventMap>()
    }

    return new NatsEventBusAdapter<AuthorityEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

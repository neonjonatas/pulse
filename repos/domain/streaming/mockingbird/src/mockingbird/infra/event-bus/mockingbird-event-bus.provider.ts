import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import {
  NatsEventBusAdapter,
  NoopEventBusAdapter,
  NatsConnectionToken
} from '@pack/nats-broker-messaging'

import { MockingbirdEventBusPort } from '@domain/ports'
import type { MockingbirdEventMap } from '@domain/events'

export const mockingbirdEventBusProvider: Provider = {
  provide: MockingbirdEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) {
      return new NoopEventBusAdapter<MockingbirdEventMap>()
    }

    return new NatsEventBusAdapter<MockingbirdEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import { NatsEventBusAdapter } from '@pack/nats-broker-messaging'

import { HybridStorageEventBusPort } from '@domain/ports'
import type { HybridStorageEventMap } from '@domain/events'

import { NoopEventBusAdapter } from './noop-event-bus.adapter'
import { NatsConnectionToken } from './nats-connection.provider'

export const hybridStorageEventBusProvider: Provider = {
  provide: HybridStorageEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) {
      return new NoopEventBusAdapter<HybridStorageEventMap>()
    }

    return new NatsEventBusAdapter<HybridStorageEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

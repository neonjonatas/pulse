import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import { NatsEventBusAdapter } from '@pack/nats-broker-messaging'

import {
  NatsConnectionToken,
  NoopEventBusAdapter
} from '@pack/nats-broker-messaging'
import type { PetrifiedEventMap } from 'src/petrified/domain/events/petrified-event.map'
import { PetrifiedEventBusPort } from 'src/petrified/application/ports/petrified-event-bus.port'

/**
 * NestJS provider that wires `PetrifiedEventBusPort` to the NATS transport.
 * Falls back to a no-op adapter when no NATS connection is available.
 */
export const petrifiedEventBusProvider: Provider = {
  provide: PetrifiedEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) return new NoopEventBusAdapter<PetrifiedEventMap>()
    return new NatsEventBusAdapter<PetrifiedEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

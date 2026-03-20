import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import { NatsEventBusAdapter } from '@pack/nats-broker-messaging'

import {
  NatsConnectionToken,
  NoopEventBusAdapter
} from '@pack/nats-broker-messaging'
import type { FortMinorEventMap } from '@domain/events'
import { FortMinorEventBusPort } from '@application/ports/fort-minor-event-bus.port'

/**
 * NestJS provider that wires `FortMinorEventBusPort` to the NATS transport.
 * Falls back to a no-op adapter when no NATS connection is available.
 */
export const fortMinorEventBusProvider: Provider = {
  provide: FortMinorEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) return new NoopEventBusAdapter<FortMinorEventMap>()
    return new NatsEventBusAdapter<FortMinorEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

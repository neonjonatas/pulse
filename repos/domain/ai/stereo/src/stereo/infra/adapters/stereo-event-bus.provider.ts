import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import { NatsEventBusAdapter } from '@pack/nats-broker-messaging'

import {
  NatsConnectionToken,
  NoopEventBusAdapter
} from '@pack/nats-broker-messaging'
import type { StereoEventMap } from '@domain/events'
import { StereoEventBusPort } from 'src/stereo/application/ports/stereo-event-bus.port'

/**
 * NestJS provider that wires `StereoEventBusPort` to the NATS transport.
 * Falls back to a no-op adapter when no NATS connection is available.
 */
export const stereoEventBusProvider: Provider = {
  provide: StereoEventBusPort,
  useFactory: (connection: NatsConnection | null) => {
    if (!connection) return new NoopEventBusAdapter<StereoEventMap>()
    return new NatsEventBusAdapter<StereoEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

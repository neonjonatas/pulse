import type { Provider } from '@nestjs/common'
import type { NatsConnection } from 'nats'
import {
  NatsEventBusAdapter,
  NatsConnectionToken
} from '@pack/nats-broker-messaging'

import { TrackEventBusPort } from '@domain/ports'
import type { TrackEventMap } from '@domain/events'

export const trackEventBusProvider: Provider = {
  provide: TrackEventBusPort,
  useFactory: (connection: NatsConnection) => {
    return new NatsEventBusAdapter<TrackEventMap>(connection)
  },
  inject: [NatsConnectionToken]
}

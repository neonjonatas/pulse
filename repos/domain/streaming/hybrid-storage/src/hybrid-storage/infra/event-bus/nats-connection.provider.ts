import type { Provider } from '@nestjs/common'
import { connect, type NatsConnection } from 'nats'

import { EventBusConfigFlag } from './event-bus-config-flag.enum'

export const NatsConnectionToken = Symbol('NATS_CONNECTION')

export const natsConnectionProvider: Provider = {
  provide: NatsConnectionToken,
  useFactory: async (): Promise<NatsConnection | null> => {
    const servers = process.env[EventBusConfigFlag.NatsUrl]

    if (!servers) {
      return null
    }

    return connect({ servers })
  }
}

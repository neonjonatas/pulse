import type { Provider } from '@nestjs/common'
import { connect, type NatsConnection } from 'nats'

import { NatsConfigFlag } from './nats-config.enum'

/**
 * NestJS DI token for shared NATS connection.
 */
export const NatsConnectionToken = Symbol('NATS_CONNECTION')

/**
 * Connects to NATS when `NATS_URL` exists.
 * Returns `null` in local/no-op mode.
 */
export const natsConnectionProvider: Provider = {
  provide: NatsConnectionToken,
  useFactory: async (): Promise<NatsConnection | null> => {
    const servers = process.env[NatsConfigFlag.NatsUrl]
    if (!servers) return null
    return connect({ servers })
  }
}
